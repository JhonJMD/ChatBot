// Elementos del DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const loadingIndicator = document.getElementById('loading-indicator');

// Historial de mensajes para contexto
let messageHistory = [
    { role: "system", content: "Eres un asistente virtual amigable y servicial." },
    { role: "assistant", content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" }
];

// Función para añadir mensaje del usuario
function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'flex mb-4 justify-end';
    messageElement.innerHTML = `
        <div class="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
            <p class="text-sm">${escapeHtml(message)}</p>
        </div>
        <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        </div>
    `;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    
    // Actualizar historial de mensajes
    messageHistory.push({ role: "user", content: message });
}

// Función para añadir respuesta del bot
function addBotMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'flex mb-4';
    messageElement.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center mr-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div class="bg-gray-100 rounded-lg p-3 max-w-xs">
            <p class="text-sm">${escapeHtml(message)}</p>
        </div>
    `;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    
    // Actualizar historial de mensajes
    messageHistory.push({ role: "assistant", content: message });
}

// Función para escapar HTML y prevenir XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Función para hacer scroll al último mensaje
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para mostrar/ocultar indicador de carga
function toggleLoading(show) {
    loadingIndicator.classList.toggle('hidden', !show);
}

// Función para obtener respuesta de la API de IA
async function getAIResponse(userMessage) {
    try {
        toggleLoading(true);
        
        // Aquí debes reemplazar la URL con la de tu API de IA preferida
        // Este es un ejemplo genérico que puedes adaptar según la API que uses
        const response = await fetch('https://api.ejemplo.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer TU_API_KEY' // Reemplaza con tu API key
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Reemplaza con el modelo que quieras usar
                messages: messageHistory,
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }
        
        const data = await response.json();
        
        // La estructura de la respuesta dependerá de la API que uses
        // Este es un ejemplo para OpenAI
        const aiMessage = data.choices[0].message.content;
        
        return aiMessage;
    } catch (error) {
        console.error("Error al obtener respuesta de la IA:", error);
        return "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.";
    } finally {
        toggleLoading(false);
    }
}

// Función para manejar el envío de mensajes
async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addUserMessage(message);
        userInput.value = '';
        userInput.focus();
        
        // Obtener respuesta de la IA
        const aiResponse = await getAIResponse(message);
        addBotMessage(aiResponse);
    }
}

// Función para manejar el envío de mensajes con una API de fallback
// Esta función se usa si la API principal falla o para pruebas
async function sendMessageWithFallback() {
    const message = userInput.value.trim();
    if (message) {
        addUserMessage(message);
        userInput.value = '';
        userInput.focus();
        
        toggleLoading(true);
        
        // Simular retraso de red
        setTimeout(() => {
            toggleLoading(false);
            
            // Respuesta de fallback simple basada en palabras clave
            let response = "Lo siento, no entiendo completamente. ¿Puedes proporcionar más detalles?";
            
            if (message.toLowerCase().includes("hola") || message.toLowerCase().includes("saludos")) {
                response = "¡Hola! ¿Cómo puedo ayudarte hoy?";
            } else if (message.toLowerCase().includes("gracias")) {
                response = "¡De nada! Estoy aquí para ayudar.";
            } else if (message.toLowerCase().includes("ayuda")) {
                response = "Puedo responder preguntas, proporcionar información o simplemente charlar. ¿Qué necesitas?";
            } else if (message.toLowerCase().includes("adiós") || message.toLowerCase().includes("hasta luego")) {
                response = "¡Hasta luego! Vuelve cuando necesites ayuda.";
            }
            
            addBotMessage(response);
        }, 1000);
    }
}

// Eventos de click y tecla Enter
sendButton.addEventListener('click', sendMessageWithFallback); // Cambia a sendMessage cuando tengas tu API configurada
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessageWithFallback(); // Cambia a sendMessage cuando tengas tu API configurada
    }
});

// Enfocar el input al cargar la página
window.addEventListener('load', () => {
    userInput.focus();
});