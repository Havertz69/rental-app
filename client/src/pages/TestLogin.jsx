import React from 'react';

function TestLogin() {
  console.log('TestLogin component rendering');
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightgreen' }}>
      <h1>TEST LOGIN PAGE</h1>
      <p>This should work without AuthContext</p>
      <input type="email" placeholder="Email" style={{ display: 'block', margin: '10px 0', padding: '10px' }} />
      <input type="password" placeholder="Password" style={{ display: 'block', margin: '10px 0', padding: '10px' }} />
      <button style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white' }}>Login</button>
    </div>
  );
}

export default TestLogin;
