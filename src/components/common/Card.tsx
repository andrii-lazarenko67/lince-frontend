import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, Divider } from '@mui/material';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  headerActions,
  noPadding = false
}) => {
  return (
    <MuiCard className={className} sx={{ boxShadow: 2 }}>
      {(title || headerActions) && (
        <>
          <CardHeader
            title={title}
            subheader={subtitle}
            action={headerActions}
            slotProps={{
              title: { variant: 'h6' },
              subheader: { variant: 'body2' }
            }}
          />
          <Divider />
        </>
      )}
      <CardContent sx={{ padding: noPadding ? 0 : 3 }}>
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;
