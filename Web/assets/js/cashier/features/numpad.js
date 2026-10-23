
function pressKey(key) {
  const value = numInput.value;

  if (key === 'C') {
    numInput.value = '';
    return;
  }

  if (key === 'back') {
    numInput.value = value.slice(0, -1);
    return;
  }

  if (key === '.') {
    if (value.includes('.')) return;

    numInput.value = value ? value + '.' : '0.';
    return;
  }

  numInput.value = value + key;
}

function pressEnter() {
  verifyAction();
}

