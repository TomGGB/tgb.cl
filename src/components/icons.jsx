// Registro de íconos (Lucide). Se importan uno a uno para que el bundle incluya solo los usados.
import {
  Activity, ArrowDown, ArrowLeftRight, ArrowUp, BellRing, Briefcase, Building2, Calendar, CalendarCheck,
  CalendarDays, CalendarPlus, Car, Check, ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock, Cloud,
  CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Coins, Copy,
  CreditCard, Download, Droplets, ExternalLink, FileSignature, FileText, Fuel, Gift, Hourglass, House, IdCard,
  Landmark, Link2, LocateFixed, Map, MapPin, Moon, Navigation, Percent, PiggyBank, Plus, Radio, ReceiptText,
  Search, Siren, Snowflake, Sofa, Star, Sun, SunMoon, Sunrise, Sunset, Thermometer, Timer, TreePalm,
  TrendingUp, TriangleAlert, UtensilsCrossed, Wallet, Wind, X, Zap, Ambulance, Flame, Shield, ShieldAlert,
  Anchor, Plane, Trees, HeartPulse, Phone,
} from 'lucide-react'

export const ICONS = {
  Activity, ArrowDown, ArrowLeftRight, ArrowUp, BellRing, Briefcase, Building2, Calendar, CalendarCheck,
  CalendarDays, CalendarPlus, Car, Check, ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock, Cloud,
  CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Coins, Copy,
  CreditCard, Download, Droplets, ExternalLink, FileSignature, FileText, Fuel, Gift, Hourglass, House, IdCard,
  Landmark, Link2, LocateFixed, Map, MapPin, Moon, Navigation, Percent, PiggyBank, Plus, Radio, ReceiptText,
  Search, Siren, Snowflake, Sofa, Star, Sun, SunMoon, Sunrise, Sunset, Thermometer, Timer, TreePalm,
  TrendingUp, TriangleAlert, UtensilsCrossed, Wallet, Wind, X, Zap, Ambulance, Flame, Shield, ShieldAlert,
  Anchor, Plane, Trees, HeartPulse, Phone,
}

export function Icon({ name, size = 18, strokeWidth = 2, ...rest }) {
  const C = ICONS[name]
  if (!C) return null
  return <C size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...rest} />
}

// Ícono de herramienta dentro de un cuadro con el color de su categoría
export function ToolIcon({ tool, size = 22, className = '' }) {
  return (
    <span className={`tool-icon ${className}`} data-cat={tool.category} aria-hidden="true">
      <Icon name={tool.icon} size={size} strokeWidth={1.9} />
    </span>
  )
}
