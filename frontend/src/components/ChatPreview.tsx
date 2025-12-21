import React from "react";

const ChatPreview: React.FC<{ text?: string }> = ({ text }) => {
	return (
		<div className="chat-preview">
			<div style={{ whiteSpace: "pre-wrap" }}>
				{text || "Your message will appear here…"}
			</div>
		</div>
	);
};

export default ChatPreview;
