import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'var(--apple-blue)',
  className = '',
  text
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-transparent rounded-full`}
        style={{
          borderTopColor: color,
          borderRightColor: `${color}33`,
          borderBottomColor: `${color}33`,
          borderLeftColor: `${color}33`
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm"
          style={{ color: 'var(--apple-secondary-label)' }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = false
}) => {
  return (
    <motion.div
      className={`${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{
        width,
        height,
        backgroundColor: 'var(--apple-gray-5)'
      }}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  showSkeleton?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Loading...',
  description = 'Please wait while we process your request',
  showSkeleton = false
}) => {
  return (
    <div
      className="p-6 rounded-2xl text-center"
      style={{ backgroundColor: 'var(--apple-gray-6)' }}
    >
      {showSkeleton ? (
        <div className="space-y-4">
          <Skeleton width="60%" height="1.5rem" className="mx-auto" />
          <Skeleton width="80%" height="1rem" className="mx-auto" />
          <Skeleton width="40%" height="1rem" className="mx-auto" />
        </div>
      ) : (
        <>
          <LoadingSpinner size="large" className="mb-4" />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--apple-label)' }}
          >
            {title}
          </h3>
          <p
            className="text-sm"
            style={{ color: 'var(--apple-secondary-label)' }}
          >
            {description}
          </p>
        </>
      )}
    </div>
  );
};

// Apple-style loading dots
export const LoadingDots: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const dotSizes = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  const dotSize = dotSizes[size];

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSize} rounded-full`}
          style={{ backgroundColor: 'var(--apple-blue)' }}
          animate={{
            y: [-4, 4, -4],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

// Progress bar component
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = false,
  animated = true
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--apple-gray-5)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--apple-blue)' }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between mt-1">
          <span
            className="text-xs"
            style={{ color: 'var(--apple-secondary-label)' }}
          >
            {clampedProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

// Full screen loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  progress?: number;
  showProgress?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title = 'Loading...',
  description = 'Please wait',
  progress,
  showProgress = false
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center"
        style={{ backgroundColor: 'var(--apple-secondary-system-background)' }}
      >
        <LoadingSpinner size="large" className="mb-6" />

        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--apple-label)' }}
        >
          {title}
        </h3>

        <p
          className="text-sm mb-6"
          style={{ color: 'var(--apple-secondary-label)' }}
        >
          {description}
        </p>

        {showProgress && progress !== undefined && (
          <ProgressBar
            progress={progress}
            showPercentage
            className="mb-4"
          />
        )}
      </motion.div>
    </motion.div>
  );
};