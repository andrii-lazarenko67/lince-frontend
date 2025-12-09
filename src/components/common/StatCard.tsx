import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  className = ''
}) => {
  const { t } = useTranslation();
  return (
    <Card
      onClick={onClick}
      className={className}
      elevation={2}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        transition: 'all 0.1s ease-in-out',
        '&:hover': onClick ? {
          boxShadow: 6,
          transform: 'translateY(-4px)'
        } : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing={0.5}
          >
            {title}
          </Typography>
          {icon && (
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 56,
                height: 56,
                boxShadow: 2
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>

        <Typography
          variant="h3"
          component="div"
          fontWeight={700}
          color="text.primary"
          sx={{ mb: 1 }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: trend ? 1 : 0 }}>
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Box display="flex" alignItems="center" mt={1.5}>
            {trend.isPositive ? (
              <TrendingUpIcon sx={{ fontSize: 20, color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 20, color: 'error.main', mr: 0.5 }} />
            )}
            <Typography
              variant="body2"
              fontWeight={600}
              color={trend.isPositive ? 'success.main' : 'error.main'}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {t('common.statCard.vsLastPeriod')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
