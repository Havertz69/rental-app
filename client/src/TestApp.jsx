import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>TEST APP - This should work</h1>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  );
}

export default TestApp;
