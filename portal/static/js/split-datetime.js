/**
 * Split datetime-local inputs into separate date + time inputs.
 * Safari's native datetime-local popup only offers a date calendar, so users
 * cannot discover how to change the time. 
 * Loaded as an ES module with jQuery and inline scripts.
 */

function splitValue(value) {
  const [date = '', time = ''] = (value || '').split('T');
  return { date, time: time.slice(0, 5) };
}

function enhance(input) {
  if (input.dataset.splitReady === '1') return;
  input.dataset.splitReady = '1';

  const { date, time } = splitValue(input.value);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = date;
  dateInput.required = input.required;
  dateInput.className = input.className;
  if (input.min) dateInput.min = input.min.split('T')[0];
  if (input.max) dateInput.max = input.max.split('T')[0];

  const timeInput = document.createElement('input');
  timeInput.type = 'time';
  timeInput.value = time;
  timeInput.required = input.required;
  timeInput.className = input.className;
  timeInput.step = input.dataset.timeStep || '60';

  // keep the labelled control accessible.
  const label = input.closest('label')
    || (input.id ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`) : null);
  const labelText = label
    ? Array.from(label.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim()
    : (input.getAttribute('aria-label') || '');
  if (labelText) {
    dateInput.setAttribute('aria-label', `${labelText} (date)`);
    timeInput.setAttribute('aria-label', `${labelText} (time, UTC)`);
  }

  const sync = () => {
    // empty date clears the value; a date with no time defaults to 00:00.
    if (!dateInput.value) {
      input.value = '';
    } else {
      input.value = `${dateInput.value}T${timeInput.value || '00:00'}`;
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  dateInput.addEventListener('change', sync);
  timeInput.addEventListener('change', sync);

  // keep the pair in sync if other code sets the value.
  input.form?.addEventListener('reset', () => {
    setTimeout(() => {
      const v = splitValue(input.value);
      dateInput.value = v.date;
      timeInput.value = v.time;
    }, 0);
  });

  // type=hidden keeps name/value in the form and stops the wrapping <label>
  // from targeting this input, so clicking the label focuses the date input.
  input.removeAttribute('required'); 
  input.type = 'hidden';
  input.after(dateInput, timeInput);
}

export function initSplitDatetime(root = document) {
  root.querySelectorAll('input[type="datetime-local"][data-split-datetime]').forEach(enhance);
}

initSplitDatetime();
