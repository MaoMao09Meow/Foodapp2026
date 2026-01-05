
import React from 'react';

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const APP_COLORS = {
  pink: '#FF69B4',
  blue: '#1E90FF',
  darkBlue: '#1C39BB',
  lightPink: '#FFB6C1',
};

export const Logo: React.FC<{ size?: string }> = ({ size = 'text-2xl' }) => (
  <div className={`flex flex-col items-center leading-none font-bold ${size}`}>
    <span style={{ color: APP_COLORS.pink }}>Sue</span>
    <span style={{ color: APP_COLORS.blue }}>AhHahn</span>
  </div>
);
