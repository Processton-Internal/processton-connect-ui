import React from 'react';
import { StringValidator } from "./StringControl";
import CodeMirrorControl from "./CodeMirrorControl";


function StringCodeControl(props) {

  return (
    <CodeMirrorControl lineNumbers={true} {...props} />
  );
}

export default StringCodeControl;
