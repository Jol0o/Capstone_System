import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotaryAnimation = keyframes`
  0% {
    transform: rotate(0deg) translateX(150%) scale(1);
  }
  25% {
    transform: rotate(90deg) translateX(150%) scale(0);
  }
  75% {
    transform: rotate(270deg) translateX(150%) scale(1.5);
  }
  100% {
    transform: rotate(360deg) translateX(150%) scale(1);
  }
`;

const Rotary = styled.div`
  &:before {
    animation: ${rotaryAnimation} 1s infinite linear;
    background-color: #0182B0;
    border-radius: 100%;
    content: "";
    display: block;
    height: 25px;
    width: 25px;
  }
`;

function Loader() {
    return (
        <div className="flex items-center justify-center w-full min-h-screen">
            <Rotary />
        </div>
    )
}

export default Loader;