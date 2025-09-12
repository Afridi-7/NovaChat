import React from 'react';

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating orbs */}
      <div className="floating-orb" style={{
        width: '120px',
        height: '120px',
        top: '15%',
        left: '10%',
        animationDelay: '0s',
        animationDuration: '8s'
      }} />
      
      <div className="floating-orb" style={{
        width: '80px',
        height: '80px',
        top: '70%',
        right: '15%',
        animationDelay: '2s',
        animationDuration: '10s'
      }} />
      
      <div className="floating-orb" style={{
        width: '100px',
        height: '100px',
        bottom: '20%',
        left: '20%',
        animationDelay: '4s',
        animationDuration: '12s'
      }} />

      <div className="floating-orb" style={{
        width: '60px',
        height: '60px',
        top: '40%',
        right: '30%',
        animationDelay: '6s',
        animationDuration: '9s'
      }} />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
            opacity: Math.random() * 0.3 + 0.1
          }}
        />
      ))}
    </div>
  );
}