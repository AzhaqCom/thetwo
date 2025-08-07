// src/components/Icons.jsx

import React from 'react';
import { FaHeart, FaFistRaised, FaDiceD20, FaCrosshairs, FaSkull, FaHatWizard,FaFlagCheckered } from 'react-icons/fa';

// Icône pour le soin
export const HeartIcon = ({ className }) => <FaHeart className={`icon ${className}`} />;

// Icône pour les dégâts physiques
export const SwordIcon = ({ className }) => <FaFistRaised className={`icon ${className}`} />;

// Icône pour les dégâts magiques
export const MagicIcon = ({ className }) => <FaHatWizard className={`icon ${className}`} />;

// Icône pour le jet de dé (ex: initiative)
export const DiceIcon = ({ className }) => <FaDiceD20 className={`icon ${className}`} />;

// Icône pour un coup raté
export const MissIcon = ({ className }) => <FaCrosshairs className={`icon ${className}`} />;

// Icône pour la mort ou la défaite
export const SkullIcon = ({ className }) => <FaSkull className={`icon ${className}`} />;
export const VictoryIcon = ({ className }) => <FaFlagCheckered className={`icon ${className}`} />;