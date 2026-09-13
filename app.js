'use strict';
// Mock data only. Replace lookup with a server-side API when adding a real database.
const employees = new Map([['12345', {name: 'Somchai', room: '305'}]]);
const form = document.getElementById('checkin-form');
const input = document.getElementById('employee-id');
const error = document.getElementById('error');
const registration = document.getElementById('registration');
const success = document.getElementById('success');
function clearError() { error.hidden = true; error.textContent = ''; input.removeAttribute('aria-invalid'); }
function checkIn(rawId) {
  const id = typeof rawId === 'string' ? rawId.trim() : '';
  const employee = employees.get(id);
  if (!id || !employee) {
    const message = !id ? 'กรุณากรอกรหัสพนักงานก่อน Check-in' : 'ไม่พบรหัสพนักงานนี้ กรุณาตรวจสอบและลองอีกครั้ง';
    registration.hidden = false; success.hidden = true;
    document.getElementById('step').textContent = '01 / 02';
    error.textContent = message; error.hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus();
    return {ok: false, message};
  }
  clearError();
  document.getElementById('guest-name').textContent = employee.name;
  document.getElementById('room-number').textContent = employee.room;
  document.getElementById('guest-id').textContent = id;
  registration.hidden = true; success.hidden = false;
  document.getElementById('step').textContent = '02 / 02';
  document.getElementById('success-title').focus({preventScroll: true});
  return {ok: true, employeeId: id, name: employee.name, room: employee.room, mock: true};
}
form.addEventListener('submit', event => {event.preventDefault(); checkIn(input.value);});
input.addEventListener('input', clearError);
document.getElementById('reset').addEventListener('click', () => {
  success.hidden = true; registration.hidden = false; form.reset(); clearError();
  document.getElementById('step').textContent = '01 / 02'; input.focus({preventScroll:true});
});
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(document.modelContext.registerTool({
      name:'check_in_demo_employee',title:'ลงทะเบียนพนักงานจำลอง',
      description:'Complete a mock event check-in and show the employee name and room. No real registration is saved.',
      inputSchema:{type:'object',properties:{employeeId:{type:'string'}},required:['employeeId'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(value){input.value = typeof value?.employeeId === 'string' ? value.employeeId : ''; return checkIn(input.value);}
    }, {signal:lifecycle.signal})).catch(() => {});
    window.addEventListener('pagehide', () => lifecycle.abort(), {once:true});
  } catch (_) { /* Optional browser API; the form works independently. */ }
}
