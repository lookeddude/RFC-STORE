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
        <div className={styles.completeMessage}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Profile complete
        </div>
      ) : (
        <div className={styles.incompleteSection}>
          {missingText && <p className={styles.missingText}>{missingText}</p>}
          <Link href="/account/profile" className={styles.cta}>
            <span>COMPLETE PROFILE</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: 6 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
