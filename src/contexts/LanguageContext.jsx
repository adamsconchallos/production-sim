import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    common: {
      round: "Round",
      status: "Status",
      submitted: "Submitted",
      refresh: "Refresh",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      actions: "Actions",
      firm: "Firm"
    },
    nav: {
      brief: "Brief",
      planner: "Planner",
      leaderboard: "Leaderboard",
      analysis: "Analysis",
      roster: "Roster",
      control: "Control",
      loans: "Loans",
      ranking: "Ranking",
      settings: "Settings",
      sign_out: "Sign Out"
    },
    login: {
      title: "StratFi",
      subtitle: "Strategy at Altitude",
      student_tab: "Student",
      instructor_tab: "Instructor",
      game_code: "Game Code",
      firm_name: "Firm Name",
      pin: "PIN",
      sign_in: "Sign In",
      signing_in: "Signing in...",
      demo: "Try Demo Mode",
      instructor_login: "Instructor Log In",
      instructor_signup: "Sign Up",
      email: "Email Address",
      password: "Password",
      first_name: "First Name",
      last_name: "Last Name",
      institution: "Institution",
      purpose: "Teaching Purpose",
      create_account: "Create Instructor Account"
    },
    roster: {
      title: "Firm Roster",
      add_firm: "Add Firm",
      upload_csv: "Upload CSV",
      download_example: "Download Example",
      placeholder: "New firm name...",
      no_firms: "No firms yet.",
      students: "Students"
    },
    control: {
      open_round: "Open Round",
      close_subs: "Close Submissions",
      clear_market: "Clear Market",
      clearing: "Clearing...",
      reset_game: "Reset Game",
      supply_analysis: "Industry Supply Analysis"
    }
  },
  es: {
    common: {
      round: "Ronda",
      status: "Estado",
      submitted: "Enviado",
      refresh: "Actualizar",
      delete: "Eliminar",
      save: "Guardar",
      cancel: "Cancelar",
      close: "Cerrar",
      actions: "Acciones",
      firm: "Empresa"
    },
    nav: {
      brief: "Resumen",
      planner: "Planificador",
      leaderboard: "Clasificación",
      analysis: "Análisis",
      roster: "Nómina",
      control: "Control",
      loans: "Préstamos",
      ranking: "Ranking",
      settings: "Ajustes",
      sign_out: "Cerrar Sesión"
    },
    login: {
      title: "StratFi",
      subtitle: "Estrategia en la Altura",
      student_tab: "Estudiante",
      instructor_tab: "Instructor",
      game_code: "Código de Juego",
      firm_name: "Nombre de Empresa",
      pin: "PIN",
      sign_in: "Entrar",
      signing_in: "Entrando...",
      demo: "Probar Modo Demo",
      instructor_login: "Iniciar Sesión Instructor",
      instructor_signup: "Registrarse",
      email: "Correo Electrónico",
      password: "Contraseña",
      first_name: "Nombre",
      last_name: "Apellido",
      institution: "Institución",
      purpose: "Propósito Académico",
      create_account: "Crear Cuenta de Instructor"
    },
    roster: {
      title: "Nómina de Empresas",
      add_firm: "Agregar Empresa",
      upload_csv: "Subir CSV",
      download_example: "Descargar Ejemplo",
      placeholder: "Nombre de la empresa...",
      no_firms: "No hay empresas aún.",
      students: "Estudiantes"
    },
    control: {
      open_round: "Abrir Ronda",
      close_subs: "Cerrar Envío",
      clear_market: "Liquidar Mercado",
      clearing: "Liquidando...",
      reset_game: "Reiniciar Juego",
      supply_analysis: "Análisis de Oferta de la Industria"
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('stratfi_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('stratfi_lang', lang);
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      if (result[key]) {
        result = result[key];
      } else {
        return path; // Fallback to key name if not found
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
