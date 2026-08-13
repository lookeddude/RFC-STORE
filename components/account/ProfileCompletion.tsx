import Link from 'next/link';
import styles from './ProfileCompletion.module.css';

interface ProfileCompletionProps {
  completionPct: number;
  missingFields?: string[];
}

export function ProfileCompletion({ completionPct, missingFields = [] }: ProfileCompletionProps) {
  const isComplete = completionPct === 100;
  
  let missingText = '';
  if (missingFields.length > 0) {
    if (missingFields.length === 1) {
      missingText = `Add your ${missingFields[0].toLowerCase()} to checkout faster.`;
    } else if (missingFields.length === 2) {
      missingText = `Add your ${missingFields[0].toLowerCase()} and ${missingFields[1].toLowerCase()} to checkout faster.`;
    } else {
      missingText = `Add your missing details to checkout faster.`;
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>PROFILE COMPLETION</span>
        <span className={styles.percentage}>{completionPct}%</span>
      </div>
      <div className={styles.barContainer}>
        <div 
          className={styles.barFill} 
          style={{ width: `${completionPct}%` }}
          aria-valuenow={completionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      {isComplete ? (
        <div className={styles.completeMessage}>Profile complete ✓</div>
      ) : (
        <div className={styles.incompleteSection}>
          {missingText && <p className={styles.missingText}>{missingText}</p>}
          <Link href="/account/profile" className={styles.cta}>
            COMPLETE PROFILE →
          </Link>
        </div>
      )}
    </div>
  );
}
