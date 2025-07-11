import React, { useState } from 'react';
import { User, Lock, Heart, Eye, EyeOff, Mail, ArrowLeft, Check, X } from 'lucide-react';

interface RegisterPageProps {
  onRegister: () => void;
  onBackToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onBackToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    return { score, checks };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return '#E76F51';
    if (passwordStrength.score <= 3) return '#F4A261';
    return '#347474';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Fraca';
    if (passwordStrength.score <= 3) return 'Média';
    return 'Forte';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de e-mail inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'Você deve concordar com os termos para continuar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate registration process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    onRegister();
  };

  const handleGoogleRegister = () => {
    // Simulate Google registration
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRegister();
    }, 1000);
  };

  const isFormValid = fullName.trim() && email.trim() && password && confirmPassword && agreeToTerms && Object.keys(errors).length === 0;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #e0f7fa 0%, #f8fafc 60%, #f4a261 100%)',
      }}
    >
      {/* Background shapes */}
      <div className="absolute inset-0 opacity-10 z-0" style={{
        background: 'radial-gradient(circle at 20% 30%, #347474 0%, transparent 60%), radial-gradient(circle at 80% 70%, #F4A261 0%, transparent 70%)',
      }} />
      
      {/* SVG pattern */}
      <div 
        className="absolute inset-0 opacity-5 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23347474' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Card */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 relative z-10 backdrop-blur-xl border border-white/40" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 rounded-full shadow-md" style={{ backgroundColor: '#347474' }}>
              <Heart size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-1 tracking-tight" style={{ color: '#347474', letterSpacing: '-0.02em' }}>Sessio</h1>
          <p className="text-lg mb-4" style={{ color: '#6C757D' }}>Sua prática, organizada e segura</p>
          <h2 className="text-2xl font-bold" style={{ color: '#343A40' }}>Criar Conta</h2>
        </div>

        {/* Google Registration */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center space-x-3 hover:bg-gray-50 mb-6"
          style={{ 
            border: '1px solid #DEE2E6',
            color: '#343A40',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Criar conta com Google</span>
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px" style={{ backgroundColor: '#DEE2E6' }}></div>
          <span className="px-4 text-sm" style={{ color: '#6C757D' }}>ou</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#DEE2E6' }}></div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              Nome Completo
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors(prev => ({ ...prev, fullName: '' }));
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-lg transition-colors ${
                  errors.fullName ? 'border-red-300' : ''
                }`}
                style={{ 
                  border: errors.fullName ? '1px solid #E76F51' : '1px solid #DEE2E6',
                  color: '#343A40'
                }}
                onFocus={(e) => {
                  if (!errors.fullName) {
                    e.target.style.borderColor = '#347474';
                    e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.fullName) {
                    e.target.style.borderColor = '#DEE2E6';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                placeholder="Digite seu nome completo"
                required
                disabled={isLoading}
              />
            </div>
            {errors.fullName && (
              <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              E-mail
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-lg transition-colors ${
                  errors.email ? 'border-red-300' : ''
                }`}
                style={{ 
                  border: errors.email ? '1px solid #E76F51' : '1px solid #DEE2E6',
                  color: '#343A40'
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = '#347474';
                    e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = '#DEE2E6';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              Senha
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                className={`w-full pl-10 pr-12 py-3 rounded-lg transition-colors ${
                  errors.password ? 'border-red-300' : ''
                }`}
                style={{ 
                  border: errors.password ? '1px solid #E76F51' : '1px solid #DEE2E6',
                  color: '#343A40'
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#347474';
                    e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#DEE2E6';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                style={{ color: '#6C757D' }}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 rounded-full"
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    {passwordStrength.checks.length ? (
                      <Check size={12} style={{ color: '#347474' }} />
                    ) : (
                      <X size={12} style={{ color: '#E76F51' }} />
                    )}
                    <span style={{ color: passwordStrength.checks.length ? '#347474' : '#6C757D' }}>
                      8+ caracteres
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {passwordStrength.checks.uppercase ? (
                      <Check size={12} style={{ color: '#347474' }} />
                    ) : (
                      <X size={12} style={{ color: '#E76F51' }} />
                    )}
                    <span style={{ color: passwordStrength.checks.uppercase ? '#347474' : '#6C757D' }}>
                      Maiúscula
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {passwordStrength.checks.numbers ? (
                      <Check size={12} style={{ color: '#347474' }} />
                    ) : (
                      <X size={12} style={{ color: '#E76F51' }} />
                    )}
                    <span style={{ color: passwordStrength.checks.numbers ? '#347474' : '#6C757D' }}>
                      Números
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {passwordStrength.checks.special ? (
                      <Check size={12} style={{ color: '#347474' }} />
                    ) : (
                      <X size={12} style={{ color: '#E76F51' }} />
                    )}
                    <span style={{ color: passwordStrength.checks.special ? '#347474' : '#6C757D' }}>
                      Especiais
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#343A40' }}>
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#6C757D' }} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                className={`w-full pl-10 pr-12 py-3 rounded-lg transition-colors ${
                  errors.confirmPassword ? 'border-red-300' : ''
                }`}
                style={{ 
                  border: errors.confirmPassword ? '1px solid #E76F51' : '1px solid #DEE2E6',
                  color: '#343A40'
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = '#347474';
                    e.target.style.boxShadow = '0 0 0 2px rgba(52, 116, 116, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = '#DEE2E6';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                style={{ color: '#6C757D' }}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="pt-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => {
                  setAgreeToTerms(e.target.checked);
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }
                }}
                className="w-4 h-4 rounded mt-0.5 transition-colors"
                style={{ 
                  accentColor: '#347474',
                  borderColor: errors.terms ? '#E76F51' : '#DEE2E6'
                }}
                disabled={isLoading}
              />
              <span className="text-sm leading-relaxed" style={{ color: '#343A40' }}>
                Concordo com os{' '}
                <a href="#" className="font-medium hover:underline" style={{ color: '#347474' }}>
                  Termos de Serviço
                </a>{' '}
                e a{' '}
                <a href="#" className="font-medium hover:underline" style={{ color: '#347474' }}>
                  Política de Privacidade
                </a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-sm mt-1" style={{ color: '#E76F51' }}>{errors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center space-x-2 mt-6"
            style={{ 
              backgroundColor: (isLoading || !isFormValid) ? '#6C757D' : '#347474',
              cursor: (isLoading || !isFormValid) ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && isFormValid) {
                e.currentTarget.style.backgroundColor = '#2d6363';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && isFormValid) {
                e.currentTarget.style.backgroundColor = '#347474';
              }
            }}
          >
            {isLoading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isLoading ? 'Criando conta...' : 'Criar Conta'}</span>
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p style={{ color: '#6C757D' }}>
            Já tem uma conta?{' '}
            <button 
              onClick={onBackToLogin}
              className="font-medium hover:underline" 
              style={{ color: '#347474' }}
              disabled={isLoading}
            >
              Entre
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;