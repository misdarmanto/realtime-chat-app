import { useState, useEffect } from "react";
import "./App.css";
import { generateId } from "./utils/generateId";

const ws = new WebSocket("ws://localhost:3000/cable");

function App() {
	const [messages, setMessages] = useState([]);
	const [userId, setUserId] = useState("");
	const messagesContainer = document.getElementById("messages");
	const avatar = "https://api.multiavatar.com/Binx";

	ws.onopen = () => {
		console.log("Connected to websocket server");
		setUserId(generateId());

		ws.send(
			JSON.stringify({
				command: "subscribe",
				identifier: JSON.stringify({
					id: userId,
					channel: "MessagesChannel",
				}),
			})
		);
	};

	ws.onmessage = (e) => {
		const data = JSON.parse(e.data);
		if (data.type === "ping") return;
		if (data.type === "welcome") return;
		if (data.type === "confirm_subscription") return;

		const message = data.message;
		setMessagesAndScrollDown([...messages, message]);
	};

	useEffect(() => {
		fetchMessages();
	}, []);

	useEffect(() => {
		resetScroll();
	}, [messages]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const body = e.target.message.value;
		e.target.message.value = "";

		await fetch("http://localhost:3000/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ body }),
		});
	};

	const fetchMessages = async () => {
		try {
			const response = await fetch("http://localhost:3000/messages");
			const data = await response.json();
			if (Array.isArray(data)) {
				setMessagesAndScrollDown(data);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const setMessagesAndScrollDown = (data) => {
		setMessages(data);
		resetScroll();
	};

	const resetScroll = () => {
		if (!messagesContainer) return;
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	};

	return (
		<div className="app">
			<h1 className="text-2xl font-bold text-blue-500 text-center">welcome to anonymous chat</h1>
			<div className="flex items-center justify-center my-5">
				<img
					class="w-10 h-10 rounded-full"
					src="https://api.multiavatar.com/Binx.png"
					alt="Rounded avatar"
				/>
				<p className="mx-2">{userId}</p>
			</div>

			<div className="messages my-5">
				{messages.map((message) => (
					<div key={message.id}>
						<span class="bg-gray-100 text-gray-500 m-2 rounded-xl text-md font-medium inline-flex items-center px-5 py-2 rounded mr-2">
							{message.body}
						</span>
					</div>
				))}
			</div>
			<div className="messageForm">
				<form onSubmit={handleSubmit}>
					<div class="flex items-center justify-center">
						<input
							name="message"
							type="text"
							class="block w-1/2 p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Type a message..."
							required
						/>
						<button
							type="submit"
							class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-5 mx-5"
						>
							Send
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default App;
