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
      console.log('ngStorage-currentStore raw content:', storeStorage);
      
      if (storeStorage) {
        var storeData = JSON.parse(storeStorage);
        console.log('Store data structure (complete):', storeData);
        console.log('All available store data keys:', Object.keys(storeData));
        
        // Deep search across nested objects for store fields
        function deepFind(obj, keys) {
          var found = null;
          function traverse(o) {
            if (!o || typeof o !== 'object' || found) return;
            for (var key in o) {
              if (!Object.prototype.hasOwnProperty.call(o, key)) continue;
              var val = o[key];
              if (keys.indexOf(key) !== -1 && val != null && val !== '') {
                found = val;
                return;
              }
              if (typeof val === 'object') traverse(val);
            }
          }
          traverse(obj);
          return found;
        }

        var possibleStoreIds = ['id_store', 'store_id', 'storeId', 'id', 'loja_id'];
        var possibleTradeNames = ['trade_name', 'tradeName', 'nome_fantasia', 'nome', 'name', 'razao_social', 'nomeFantasia', 'fantasy_name'];
        var possiblePhones = ['phone_1', 'phone1', 'telefone', 'phone', 'phone_2', 'fone1', 'tel1', 'telefone1'];

        // Prefer deep search results; keep previously found simple values as fallback
        storeId = deepFind(storeData, possibleStoreIds) || storeId;
        tradeName = deepFind(storeData, possibleTradeNames) || tradeName;
        storePhone1 = deepFind(storeData, possiblePhones) || storePhone1;


        
        console.log('=== FINAL STORE DATA EXTRACTED ===');
        console.log('Store ID:', storeId);
        console.log('Trade Name:', tradeName);
        console.log('Store Phone:', storePhone1);
        
        // Alertas para campos não encontrados
        if (!storeId) {
          console.warn('⚠️ No store ID found in any of the expected fields!');
        }
        if (!tradeName) {
          console.warn('⚠️ No trade name found in any of the expected fields!');
          console.warn('Available keys were:', Object.keys(storeData));
        }
        if (!storePhone1) {
          console.warn('⚠️ No phone found in any of the expected fields!');
        }
      } else {
        console.error('❌ ngStorage-currentStore not found in localStorage');
        console.log('Available localStorage keys:', Object.keys(localStorage));
      }
    } catch (e) {
      console.error('❌ Error accessing ngStorage-currentStore:', e);
    }

    return {
      storeId: storeId || 'N/A',
      tradeName: tradeName || 'Nome não encontrado',
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
    maxWaitMs = maxWaitMs || 10000;
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
          accountId: userData.userId,
          visitorId: storeData.storeId,
          userFullName: userData.userFullName,
          userEmail: userData.userEmail,
          storePhone1: storeData.storePhone1,
          tradeName: storeData.tradeName,
          storeId: storeData.storeId + " - " + storeData.tradeName
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
          accountId: userData.userId || '',
          visitorId: storeData.storeId || '',
          userFullName: userData.userFullName || '',
          userEmail: userData.userEmail || '',
          storePhone1: storeData.storePhone1 || '',
          tradeName: storeData.tradeName || '',
          storeId: (storeData.storeId || '') + " - " + (storeData.tradeName || '')
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