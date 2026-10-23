
const messageIcons = {
  question: 'question.svg',
  success: 'check.svg',
  error: 'warning.svg'
};

// One small modal for questions, completed actions and errors.
// Resolves true when the main button is pressed, false otherwise.
function showMessageModal({ type, title, message, confirmText = 'OK', cancelText = '', autoClose = 0 }) {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.className = `message-modal ${type}`;

    dialog.innerHTML = `
      <div class="message-icon">
        <img src="${window.APP_ROOT || '../'}assets/images/${messageIcons[type]}" alt="">
      </div>
      <h2 class="message-title"></h2>
      <p class="message-text"></p>
      <div class="message-actions">
        ${cancelText ? '<button type="button" class="message-cancel"></button>' : ''}
        <button type="button" class="message-confirm"></button>
      </div>
    `;

    dialog.querySelector('.message-title').textContent = title;
    dialog.querySelector('.message-text').textContent = message;
    dialog.querySelector('.message-confirm').textContent = confirmText;

    if (cancelText) {
      dialog.querySelector('.message-cancel').textContent = cancelText;
      dialog.querySelector('.message-cancel').onclick = () => dialog.close();
    }

    let result = false;

    dialog.querySelector('.message-confirm').onclick = () => {
      result = true;
      dialog.close();
    };

    dialog.addEventListener('close', () => {
      dialog.remove();
      resolve(result);
    });

    document.body.appendChild(dialog);
    dialog.showModal();

    if (autoClose) {
      setTimeout(() => {
        if (!dialog.open) return;
        result = true;
        dialog.close();
      }, autoClose);
    }
  });
}

function askModal(message, confirmText = 'Yes', title = 'Are you sure?') {
  return showMessageModal({ type: 'question', title, message, confirmText, cancelText: 'Cancel' });
}

function successModal(message, title = 'Complete') {
  return showMessageModal({ type: 'success', title, message, confirmText: 'OK', autoClose: 2000 });
}

function errorModal(message, title = 'Something went wrong') {
  return showMessageModal({ type: 'error', title, message, confirmText: 'OK' });
}

function createModal(title, content, onSubmit = null, className = '') {
  document.getElementById('customModal')?.remove();

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="customModal" class="custom-modal ${className}">
      <div class="modal-header">
        <h2></h2>
        <button type="button" class="closeModalbtn">&times;</button>
      </div>

      <form id="modalForm">
        <div class="modal-body">
          ${content}
        </div>

        <div class="modal-actions">
          <button type="button" class="cancelModalbtn">Cancel</button>
          <button type="submit" class="saveModalbtn">Save</button>
        </div>
      </form>
    </dialog>
  `);

  const modal = document.getElementById('customModal');
  const form = document.getElementById('modalForm');
  const saveBtn = form.querySelector('.saveModalbtn');
  const cancelBtn = form.querySelector('.cancelModalbtn');

  modal.querySelector('.modal-header h2').textContent = title;

  modal.querySelector('.closeModalbtn').onclick = () => modal.close();
  cancelBtn.onclick = () => modal.close();

  modal.addEventListener('close', () => modal.remove());

  if (!onSubmit) {
    saveBtn.remove();
    cancelBtn.textContent = 'Close';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!onSubmit) return;

    saveBtn.disabled = true;

    try {
      const result = await onSubmit(new FormData(form), form);

      if (result === false) return;

      modal.close();
      successModal('Your changes have been saved.', 'Saved');
    } catch (error) {
      console.error(error);
      const box = form.querySelector('.modal-error');
      if (box) box.textContent = 'Unable to save: ' + (error.message || error);
      else errorModal('Unable to save. Please try again.');
    } finally {
      saveBtn.disabled = false;
    }
  });

  modal.showModal();

  return modal;
}
