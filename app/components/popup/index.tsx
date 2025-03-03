import { Box, Button } from '@mercury-js/mess';
import { X } from 'lucide-react';
import React from 'react';
import { Outlet } from 'react-router';

function PopUp({ isOpen, onClose,children }) {
  if (!isOpen) return null;

  return (
    <Box styles={{
      base: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }
    }}>
      <Box styles={{
        base: {
        //   width: "300px",
          padding: "10px",
          background: "white",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          position: "relative",
          border:"1px solid #D9D9D9"
        }
      }}>
        <Button onClick={onClose} styles={{
          base: {
            position: "absolute",
            top: "10px",
            right: "10px",
            // color: "black",
            border: "none",
            cursor: "pointer"
          }
        }}>
          <X color='#525252'/>
        </Button>
        {children}
      </Box>
    </Box>
  );
}

export default PopUp;
