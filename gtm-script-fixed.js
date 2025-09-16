<script>
(function() {
  // Função para extrair dados do usuário do ngStorage-user
  function getUserData() {
    var userId = '';
    var userFullName = '';
    var userEmail = '';

    try {
      var userStorage = localStorage.getItem('ngStorage-user');
      console.log('=== DEBUG USER DATA ===');
      console.log('ngStorage-user exists:', !!userStorage);
      
      if (userStorage) {
        var userData = JSON.parse(userStorage);
        console.log('User data structure:', userData);
        
        // Campos corretos baseados na estrutura real
        userId = userData.id_user || userData.userId || userData.user_id || userData.id || '';
        userFullName = userData.full_name || userData.fullName || userData.name || userData.first_name || '';
        userEmail = userData.email || userData.login || userData.user_email || '';
        
        console.log('Extracted user data:', {
          userId: userId,
          userFullName: userFullName,
          userEmail: userEmail
        });
      } else {
        console.log('ngStorage-user not found in localStorage');
      }
    } catch (e) {
      console.error('Error accessing ngStorage-user:', e);
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
    var tradeName = '';

    try {
      var storeStorage = localStorage.getItem('ngStorage-currentStore');
      console.log('=== DEBUG STORE DATA ===');
      console.log('ngStorage-currentStore exists:', !!storeStorage);
      
      if (storeStorage) {
        var storeData = JSON.parse(storeStorage);
        console.log('Store data structure:', storeData);
        
        // Campos corretos baseados na estrutura real
        storeId = storeData.id_store || storeData.storeId || storeData.store_id || storeData.id || '';
        tradeName = storeData.trade_name || storeData.tradeName || storeData.nome_fantasia || 
                   storeData.nome || storeData.name || storeData.razao_social || '';
        storePhone1 = storeData.phone_1 || storeData.phone1 || storeData.telefone || storeData.phone || storeData.phone_2 || '';
        
        console.log('Extracted store data:', {
          storeId: storeId,
          tradeName: tradeName,
          storePhone1: storePhone1
        });
      } else {
        console.log('ngStorage-currentStore not found in localStorage');
      }
    } catch (e) {
      console.error('Error accessing ngStorage-currentStore:', e);
    }

    return {
      storeId: storeId,
      tradeName: tradeName,
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
        console.log('=== IFRAME READY - COLLECTING DATA ===');
        
        // Buscar dados do usuário e da loja
        var userData = getUserData();
        var storeData = getStoreData();

        // Mapear os dados para enviar ao iframe
        var dataToSend = {
          type: 'INIT_SUGGESTION_FORM',
          accountId: userData.userId,              // ID do usuário
          visitorId: storeData.storeId,           // ID da loja
          userFullName: userData.userFullName,    // Nome completo do usuário
          userEmail: userData.userEmail,          // Email do usuário
          storePhone1: storeData.storePhone1,     // Telefone da loja
          tradeName: storeData.tradeName,         // Nome fantasia da loja
          storeId: storeData.storeId && storeData.tradeName 
            ? storeData.storeId + ' - ' + storeData.tradeName 
            : storeData.storeId                   // ID da loja no formato "id_store - trade_name"
        };

        console.log('=== FINAL DATA TO SEND ===');
        console.log('Data being sent to iframe:', dataToSend);
        console.log('Data validation:', {
          hasUserId: !!dataToSend.accountId,
          hasStoreId: !!dataToSend.visitorId,
          hasUserName: !!dataToSend.userFullName,
          hasUserEmail: !!dataToSend.userEmail,
          hasStorePhone: !!dataToSend.storePhone1
        });

        // Enviar dados para o iframe
        var iframe = document.getElementById('suggestion-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(dataToSend, '*');
          console.log('✅ Data sent to iframe successfully!');
        } else {
          console.error('❌ Failed to find iframe or contentWindow');
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

  // Criar botão para abrir modal
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

    btn.onclick = function() {
      console.log('=== SUGGESTION BUTTON CLICKED ===');
      createSuggestionModal();
    };
    
    document.body.appendChild(btn);
    console.log('✅ Suggestion button created and added to page');
  }

  // Inicializar quando a página carregar
  function initialize() {
    console.log('=== GTM SCRIPT INITIALIZED ===');
    console.log('Page ready state:', document.readyState);
    createTriggerButton();
    
    // Testar dados imediatamente para debug
    console.log('=== INITIAL DATA TEST ===');
    var userData = getUserData();
    var storeData = getStoreData();
    console.log('Initial test - User data available:', !!userData.userId);
    console.log('Initial test - Store data available:', !!storeData.storeId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
</script>