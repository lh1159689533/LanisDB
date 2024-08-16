import { SvgIcon } from '@mui/material';

export function CloseIcon({ size = 16, className, onClick }) {
  return (
    <SvgIcon fontSize="inherit" className={className} onClick={onClick} style={{ fontSize: size }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
        <g fill="none">
          <path d="M3.5 3.5L12.5 12.5M3.5 12.5L12.5 3.5" stroke="currentColor" strokeLinejoin="round"></path>
        </g>
      </svg>
    </SvgIcon>
  );
}
