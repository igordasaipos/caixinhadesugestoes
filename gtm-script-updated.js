<script>
(function() {
  // Função para extrair dados do usuário do ngStorage-user
  function getUserData() {
    var userId = '';
    var userFullName = '';
    var userEmail = '';

    try {
      var userStorage = localStorage.getItem('ngStorage-user');
      console.log('ngStorage-user conteúdo completo:', userStorage);
      
      if (userStorage) {
        var userData = JSON.parse(userStorage);
        console.log('userData parsed:', userData);
        
        // Buscar ID do usuário
        userId = userData.id_user || userData.userId || userData.user_id || userData.id || '';
        
        // Buscar nome completo - várias possibilidades
        userFullName = userData.full_name || userData.fullName || userData.name || 
                      userData.nome_completo || userData.nomeCompleto || userData.displayName || '';
        
        // Buscar email
        userEmail = userData.email || userData.e_mail || userData.user_email || '';
        
        console.log('Dados do usuário extraídos:', {
          userId: userId,
          userFullName: userFullName,
          userEmail: userEmail
        });
      }
    } catch (e) {
      console.log('Erro ao acessar ngStorage-user:', e);
    }

    return {
      userId: userId,
      userFullName: userFullName,
      userEmail: userEmail
    };
  }

  // Função para extrair dados da loja do ngStorage-currentStore
  function getStoreData() {
    var storeId = '';
    var storePhone1 = '';

    try {
      var storeStorage = localStorage.getItem('ngStorage-currentStore');
      console.log('ngStorage-currentStore conteúdo completo:', storeStorage);
      
      if (storeStorage) {
        var storeData = JSON.parse(storeStorage);
        console.log('storeData parsed:', storeData);
        
        // Buscar ID da loja
        storeId = storeData.id_store || storeData.storeId || storeData.store_id || 
                 storeData.id || storeData.loja_id || '';
        
        // Buscar telefone principal - várias possibilidades
        storePhone1 = storeData.phone1 || storeData.telefone || storeData.phone || 
                     storeData.telefone1 || storeData.fone1 || storeData.tel1 || '';
        
        console.log('Dados da loja extraídos:', {
          storeId: storeId,
          storePhone1: storePhone1
        });
      }
    } catch (e) {
      console.log('Erro ao acessar ngStorage-currentStore:', e);
    }

    return {
      storeId: storeId,
      storePhone1: storePhone1
    };
  }

  // Função para criar e mostrar o modal com o iframe
  function createSuggestionModal() {
    // Verificar se já existe
    if (document.getElementById('suggestion-modal')) return;

    // Criar overlay do modal
    var overlay = document.createElement('div');
    overlay.id = 'suggestion-modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    // Criar container do modal
    var modal = document.createElement('div');
    modal.id = 'suggestion-modal';
    modal.style.backgroundColor = '#fff';
    modal.style.borderRadius = '8px';
    modal.style.padding = '20px';
    modal.style.maxWidth = '500px';
    modal.style.width = '90%';
    modal.style.position = 'relative';
    modal.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';

    // Botão de fechar
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '15px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#999';

    // Criar iframe
    var iframe = document.createElement('iframe');
    iframe.src = 'https://caixinhadesugestoes.lovable.app/';
    iframe.style.width = '100%';
    iframe.style.height = '400px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '4px';
    iframe.id = 'suggestion-iframe';

    // Montar modal
    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event listeners
    closeBtn.onclick = function() {
      document.body.removeChild(overlay);
    };

    overlay.onclick = function(e) {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    };

    // Configurar comunicação com iframe
    setupPostMessage();
  }

  // Função para configurar a comunicação postMessage
  function setupPostMessage() {
    function handleMessage(event) {
      if (event.data && event.data.type === 'SUGGESTION_FORM_READY') {
        // Buscar dados do usuário e da loja
        var userData = getUserData();
        var storeData = getStoreData();

        // Mapear os dados para enviar ao iframe
        var dataToSend = {
          type: 'INIT_SUGGESTION_FORM',
          accountId: userData.userId,           // ID do usuário
          visitorId: storeData.storeId,        // ID da loja
          userFullName: userData.userFullName, // Nome completo do usuário
          userEmail: userData.userEmail,       // Email do usuário
          storePhone1: storeData.storePhone1   // Telefone da loja
        };

        console.log('Todos os dados coletados para envio:', dataToSend);

        // Enviar dados para o iframe
        var iframe = document.getElementById('suggestion-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(dataToSend, '*');
          console.log('Dados enviados para iframe com sucesso!');
        }
      }
    }

    // Adicionar listener
    if (window.addEventListener) {
      window.addEventListener('message', handleMessage, false);
    } else if (window.attachEvent) {
      window.attachEvent('onmessage', handleMessage);
    }
  }

  // Criar botão para abrir modal (opcional)
  function createTriggerButton() {
    var btn = document.createElement('button');
    btn.innerHTML = 'Enviar Sugestão';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.backgroundColor = '#007bff';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.padding = '10px 15px';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '9998';
    btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';

    btn.onclick = createSuggestionModal;
    document.body.appendChild(btn);
  }

  // Inicializar quando a página carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      createTriggerButton();
    });
  } else {
    createTriggerButton();
  }

})();
</script>