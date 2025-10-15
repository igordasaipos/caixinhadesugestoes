<script>
(function() {
  // Função simplificada para extrair dados do usuário do ngStorage-user
  function getUserData() {
    try {
      var userStorage = localStorage.getItem('ngStorage-user');
      console.log('✅ Reading ngStorage-user');
      
      if (!userStorage) {
        console.error('❌ ngStorage-user não encontrado');
        return { userId: '', userFullName: '', userEmail: '' };
      }
      
      var userData = JSON.parse(userStorage);
      console.log('📊 User data:', { 
        id_user: userData.id_user, 
        full_name: userData.full_name, 
        email: userData.email 
      });
      
      return {
        userId: String(userData.id_user || ''),
        userFullName: userData.full_name || '',
        userEmail: userData.email || ''
      };
    } catch (e) {
      console.error('❌ Erro ao ler ngStorage-user:', e);
      return { userId: '', userFullName: '', userEmail: '' };
    }
  }

  // Função simplificada para extrair dados da loja do ngStorage-currentStore
  function getStoreData() {
    try {
      var storeStorage = localStorage.getItem('ngStorage-currentStore');
      console.log('✅ Reading ngStorage-currentStore');
      
      if (!storeStorage) {
        console.error('❌ ngStorage-currentStore não encontrado');
        return { storeId: '', tradeName: '', storePhone: '' };
      }
      
      var storeData = JSON.parse(storeStorage);
      console.log('📊 Store data:', { 
        id_store: storeData.id_store, 
        trade_name: storeData.trade_name, 
        phone_1: storeData.phone_1 
      });
      
      return {
        storeId: String(storeData.id_store || ''),
        tradeName: storeData.trade_name || '',
        storePhone: storeData.phone_1 || ''
      };
    } catch (e) {
      console.error('❌ Erro ao ler ngStorage-currentStore:', e);
      return { storeId: '', tradeName: '', storePhone: '' };
    }
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
    console.log('GTM: Setting up postMessage handler');
    window.addEventListener('message', function(event) {
      console.log('GTM: Received message from iframe:', event.data);
      
      if (event.data && event.data.type === 'SUGGESTION_FORM_READY') {
        console.log('GTM: Iframe is ready, waiting for data...');
        waitForDataThenSend(event.source);
      }
    });
  }

  function waitForDataThenSend(iframeSource, maxWaitMs, intervalMs) {
    maxWaitMs = maxWaitMs || 5000;  // Reduzido de 10s para 5s
    intervalMs = intervalMs || 300;
    
    console.log('GTM: Starting waitForDataThenSend with maxWait:', maxWaitMs, 'ms');
    
    var startTime = Date.now();
    var pollInterval = setInterval(function() {
      var elapsed = Date.now() - startTime;
      console.log('GTM: Polling for data... elapsed:', elapsed, 'ms');
      
      var userData = getUserData();
      var storeData = getStoreData();
      
      // Check if we have the minimum required data
      var hasRequiredUserData = userData.userId;
      var hasRequiredStoreData = storeData.storeId && storeData.tradeName;
      
      console.log('GTM: Data check:', { 
        hasRequiredUserData: hasRequiredUserData, 
        hasRequiredStoreData: hasRequiredStoreData,
        userData: userData,
        storeData: storeData 
      });
      
      if (hasRequiredUserData && hasRequiredStoreData) {
        console.log('GTM: ✅ All required data found! Sending to iframe...');
        clearInterval(pollInterval);
        
        var dataToSend = {
          type: 'INIT_SUGGESTION_FORM',
          userId: userData.userId,
          userFullName: userData.userFullName,
          userEmail: userData.userEmail,
          storeId: storeData.storeId,
          storeName: storeData.tradeName,
          storePhone: storeData.storePhone
        };
        
        console.log('GTM: Final data being sent:', dataToSend);
        iframeSource.postMessage(dataToSend, '*');
        return;
      }
      
      if (elapsed >= maxWaitMs) {
        console.log('GTM: ❌ Timeout reached, sending whatever data we have...');
        clearInterval(pollInterval);
        
        var dataToSend = {
          type: 'INIT_SUGGESTION_FORM',
          userId: userData.userId || '',
          userFullName: userData.userFullName || '',
          userEmail: userData.userEmail || '',
          storeId: storeData.storeId || '',
          storeName: storeData.tradeName || '',
          storePhone: storeData.storePhone || ''
        };
        
        console.log('GTM: Fallback data being sent:', dataToSend);
        iframeSource.postMessage(dataToSend, '*');
        return;
      }
    }, intervalMs);
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