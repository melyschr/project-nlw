// const apiKeyInput = document.querySelector('#apiKey'); // pesquisa por seletor
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const apiKeyInput = document.getElementById('apiKey')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.0-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    // ENGENHARIA DE PROMPT
    const pergunta = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}
        ## Tarefas
        - Você deve responder perguntas ao usuario com base no seu conhecimento sobre o jogo, estrategias, build e dar dicas,
        - Ao final da resposta, esteja aberto a sujestoes de estrategias definidas pelo usuario e complemente se possivel o que pode ser melhorado com base no que o usuario digito, e com base no seu conhecimento sobre o jogo
        ## Regras
        - Se voce não sabe a resposta responda com 'Não sei' de forma sincera e não tente inventar uma resposta
        - Se a pergunta não tiver relação com o jogo responda com 'Essa pergunta não tem relação com o jogo ${game}'
        - Considere a data atual $(new Date().toLocaleDateString('pt-BR'))
        - Faça pesquisas atualizada sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que voce não tenha certeza de que existe no patch atual
        ## Cenarios de uso
        - Análise de Build e Counters
        - Estratégia de Rota e Prioridades
        - Estrate
        - Adaptação de itemização em tempo real
        - controle de mapa e visão
        - cenarios de um late gam e team fights
        - analise de contexto de jogo
        - sujestoes de estrategia de jogo para gasha e jrpg, caso o jogo seja Persona


        ## Resposta
        - Economize na resposta, seja direto e responda no maximo 500 caracteres.
        - Se a pergunta do usuario for pouco especifica, de uma sujestão de prompt com base na pergunta que ele fez e considerando o contexto do jogo, se necessario baseie-se nos cenarios de uso.
        - Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que usuario pediu.
        --- 
        # Exemplo de resposta
        As perguntas do usuario podem incluir, não necessariamente nesta ordem: 
        - o personagem do jogo ${game}
        - a função do heroi no jogo (role)
        - os itens
        - as estrategias
        - e objetivo
        resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n
        # Outro exemplo de resposta
        Com base no jogo ${game} e no contexto dele, de uma pesquisada mais aprofundada sobre o enredo do jogo, explique o que é necessario fazer, e de sujestões para iniciantes do que pode ser feito no jogo
        resposta: No início do jogo, colete madeira e 3 blocos de lã para fazer uma cama
        Em seguida, procure comida em vilas de aldeões, ou mate carneiros, porcos e vacas para encher sua barra de stamina 
        Se a noite chegar e você não estiver preparado 
        Faça um abrigo provisório para evitar os monstros
        Ou crie uma casa feita de terra com pedra próxima e colete minérios como carvão e ferro para fazer armas, armaduras e carvão para combustível
        ---
        Aqui está a pergunta do usuário: ${question}
        `
    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    // chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')
    } catch (error) {
        console.log('Erro: ', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}

form.addEventListener('submit', enviarFormulario)

