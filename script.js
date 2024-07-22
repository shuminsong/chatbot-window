const chatbotToggler = document.querySelector(".chatbot-toggler");
const fullscreenBtn = document.querySelector(".fullscreen-btn");
const fullscreenIcon = document.getElementById("fullscreen-icon");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector("#send-btn");
const plusWindowBtn = document.querySelector("#plus-window");

let userMessage = null; // Variable to store user's message
const API_URL = "http://52.196.161.77:8000/chatbot/chat"; // Replace with actual API URL
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = (chatElement) => {
    const API_URL = "http://52.196.161.77:8000/chatbot/chat"; // Replace with your actual API URL
    const messageElement = chatElement.querySelector("p");

    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: "123", // Replace with the actual user ID
            user_question: userMessage,
            topic_id: 0 // Assuming topic_id is 0 by default
        })
    }

    // Send POST request to API
    fetch(API_URL, requestOptions).then(async res => {
        if (!res.ok) {
            let errorMsg = `Server Error: ${res.status} ${res.statusText}`;
            if (res.status === 404) {
                errorMsg = "Error 404: The requested resource was not found.";
            } else if (res.status === 500) {
                errorMsg = "Error 500: Internal Server Error. Please try again later.";
            }
            throw new Error(errorMsg);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let content = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            content += decoder.decode(value, { stream: true });

            // Parse the markdown content before setting it as the message element's inner HTML
            messageElement.innerHTML = marked.parse(content);
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }

        // Decode the final text
        content += decoder.decode();
        messageElement.innerHTML = marked.parse(content.trim());

    }).catch((error) => {
        let errorMsg = `Oops! Something went wrong. Error: ${error.message}`;
        if (error.name === 'TypeError') {
            errorMsg = "Network Error: Unable to reach the server. Please check your internet connection.";
        } else if (error.message.includes("Server Error")) {
            errorMsg = error.message; // Specific server error messages handled earlier
        }

        messageElement.classList.add("error");
        messageElement.textContent = errorMsg;
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}



const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);

    // resize the textarea after sending a message
    chatInput.style.height = '55px';
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

const restartChat = () => {
    // Clear chat history (assuming chatbox is your chat history container)
    chatbox.innerHTML = '';

    // Clear input field
    chatInput.value = '';
    chatInput.style.height = `${inputInitHeight}px`; // Reset input field height if needed

    // Reset any other necessary state variables
    userMessage = null; // Reset user's message variable
};

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

fullscreenBtn.addEventListener("click", () => {
    document.body.classList.toggle("fullscreen");
    if (document.body.classList.contains("fullscreen")) {
        fullscreenIcon.classList.remove("fa-expand-alt");
        fullscreenIcon.classList.add("fa-compress-alt");
    } else {
        fullscreenIcon.classList.remove("fa-compress-alt");
        fullscreenIcon.classList.add("fa-expand-alt");
    }
});

plusWindowBtn.addEventListener("click", () => {
    restartChat(); // Call the restart function when plus-window button is clicked

    chatbox.appendChild(createChatLi("Hi there. \nHow can I help you today?", "incoming"));
    handleChat();
});
