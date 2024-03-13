import React, { useState, useEffect, ChangeEvent } from "react";
import "./App.css"; 

const ToggleSwitch: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const handleToggleChange = () => {
    onChange(value === 0 ? 1 : 0);
  };

  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={value === 1}
        onChange={handleToggleChange}
      />
      <span className="slider round"></span>
    </label>
  );
};

const Calculator: React.FC = () => {
  const [amountETH, setAmountETH] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [usdtAmount, setUSDTAmount] = useState<number | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const handleSocketMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    
    if (
      Array.isArray(data.b) &&
      data.b.length > 0 &&
      Array.isArray(data.b[0]) &&
      data.b[0].length > 0
    ) {
      const price = parseFloat(data.b[0][0]); 
      setUSDTAmount(calculateUSDTAmount(amountETH, price, sliderValue));
    } else {
      console.error("Invalid data structure:", data);
    }
  };

  useEffect(() => {
    const newSocket = new WebSocket(
      "wss://stream.binance.com:9443/ws/bnbbtc@depth"
    );
    setSocket(newSocket);

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      if (socket) {
        socket.removeEventListener("message", handleSocketMessage);
      }
    };
  }, [amountETH, sliderValue, socket]);

  const calculateUSDTAmount = (
    amountETH: number,
    priceETH: number,
    sliderValue: number
  ): number => {
    if (sliderValue === 0) {
      return amountETH * priceETH;
    } else {
      return amountETH / priceETH;
    }
  };

  const handleAmountETHChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmountETH(parseFloat(e.target.value));
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value));
  };

  return (
    <div className="container">
      <div className="calculator">
        <h2>USDT/ETH Calculator</h2>
        <label htmlFor="amountETH">Enter ETH Amount:</label>
        <input
          type="number"
          id="amountETH"
          step="any"
          value={amountETH}
          onChange={handleAmountETHChange}
        />
        <br />
        <ToggleSwitch value={sliderValue} onChange={setSliderValue} />
        {sliderValue === 0 ? <div>Selling ETH</div> : <div>Buying ETH</div>}
        {usdtAmount !== null && (
          <div>Amount of USDT required: {usdtAmount.toFixed(2)}</div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="app">
      <Calculator />
    </div>
  );
};

export default App;
