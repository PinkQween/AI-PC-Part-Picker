import React, { useState, useMemo, useEffect } from 'react';
import type { SurveyState } from './types';
import { SurveyStep } from './components/SurveyStep';
import { Recommendations } from './components/Recommendations';
import { generateRecommendations } from './utils/recommendationEngine';
import './App.css';

type AppStep = 'survey' | 'results';

const LAST_UPDATED = 'January 10, 2026';

const App: React.FC = () => {
  const [appStep, setAppStep] = useState<AppStep>('survey');
  const [surveyState, setSurveyState] = useState<SurveyState>({
    useCases: [],
    budget: null,
    budgetType: 'soft',
    storageCapacity: null,
    needsWireless: null,
    needsExpansionSlots: null,
    needsSoundCard: null,
    needsCaptureCard: null,
    operatingSystem: null,
  });

  // Parse share URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    
    if (shareParam) {
      try {
        const shareData = JSON.parse(decodeURIComponent(shareParam));
        if (shareData.useCases && Array.isArray(shareData.useCases) && shareData.budget) {
          // Set survey state from share data with all required fields
          setSurveyState(prev => ({
            ...prev,
            useCases: shareData.useCases,
            budget: shareData.budget,
            budgetType: shareData.budgetType || 'soft',
          }));
          // Go directly to results
          setAppStep('results');
        }
      } catch (err) {
        console.log('Failed to parse share URL:', err);
      }
    }
  }, []);

  const recommendations = useMemo(
    () => generateRecommendations(surveyState),
    [surveyState]
  );

  const handleSurveyComplete = () => {
    setAppStep('results');
  };

  const handleBackToSurvey = () => {
    setAppStep('survey');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>🖥️ PC Part Picker</h1>
          <p>Find the perfect PC build for your needs</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {appStep === 'survey' ? (
            <SurveyStep
              state={surveyState}
              setState={setSurveyState}
              onNext={handleSurveyComplete}
            />
          ) : (
            <Recommendations
              recommendations={recommendations}
              useCases={surveyState.useCases}
              surveyState={surveyState}
              onBack={handleBackToSurvey}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p><strong>⚠️ AI-Generated Content Disclaimer</strong></p>
          <p>This PC Part Picker was built using AI and provides component recommendations based on available data. 
          The hardware prices and specifications may not be current and could differ from actual market prices.</p>
          <p>Always verify current prices and availability before purchasing. Last updated: <strong>{LAST_UPDATED}</strong></p>
          <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#aaa' }}>
            This tool is for informational purposes only. Recommendations are AI-generated and may not reflect real-time market conditions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
