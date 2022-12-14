import React from 'react';
import SvgIcon from "@material-ui/core/SvgIcon";

export default function QuickAccessIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M21.58,5.27H19V2.35A2.35,2.35,0,0,0,16.61,0H7.39A2.35,2.35,0,0,0,5,2.35V5.27H2.42A2.35,2.35,0,0,0,.08,7.62v14A2.35,2.35,0,0,0,2.42,24H21.58a2.35,2.35,0,0,0,2.34-2.35v-14A2.35,2.35,0,0,0,21.58,5.27Zm-15-2.92a.85.85,0,0,1,.85-.85h9.22a.85.85,0,0,1,.85.85v14l-.05,0L13,13.7a1.84,1.84,0,0,0-1.92,0l-4.5,2.61Zm15.88,19.3a.85.85,0,0,1-.84.85H2.42a.85.85,0,0,1-.84-.85v-14a.85.85,0,0,1,.84-.85H5v9.54a1.53,1.53,0,0,0,2.31,1.32L11.8,15a.41.41,0,0,1,.4,0l4.45,2.64a1.56,1.56,0,0,0,.78.22A1.55,1.55,0,0,0,19,16.31V6.77h2.62a.85.85,0,0,1,.84.85Z" />
    </SvgIcon>
  );
}
