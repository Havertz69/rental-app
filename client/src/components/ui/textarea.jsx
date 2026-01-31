import React from 'react';
export const Textarea = (props) => <textarea {...props} className={`px-3 py-2 border rounded ${props.className || ''}`} />;
export default Textarea;
