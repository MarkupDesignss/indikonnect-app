// app/page.js
'use client';

import { useState } from 'react';
import DisclaimerModal from '../../components/common/DisclaimerModal';
import styles from './page.module.css';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleConfirm = () => {
    setHasAgreed(true);
    console.log('User has agreed to terms and conditions');
  };

  const handleClose = () => {
    setIsModalOpen(false);
    console.log('Modal closed without agreement');
  };

  return (
    <main className={styles.main}>
      <DisclaimerModal 
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />

      <div className={styles.content}>
        <h1>Welcome to Our Platform</h1>
        <p>Status: {hasAgreed ? 'You have agreed to the terms' : 'Terms not yet accepted'}</p>
        
        {!isModalOpen && !hasAgreed && (
          <button 
            className={styles.reopenButton}
            onClick={() => setIsModalOpen(true)}
          >
            View Terms Again
          </button>
        )}
      </div>
    </main>
  );
}