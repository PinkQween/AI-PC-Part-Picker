import React, { useState } from 'react';
import type { UseCase, SurveyState, BudgetType } from '../types';

interface SurveyStepProps {
  state: SurveyState;
  setState: React.Dispatch<React.SetStateAction<SurveyState>>;
  onNext: () => void;
}

export const SurveyStep: React.FC<SurveyStepProps> = ({ state, setState, onNext }) => {
  const [step, setStep] = useState<'usecases' | 'storage' | 'budget' | 'budgettype' | 'features' | 'os'>('usecases');

  const useCaseOptions: { value: UseCase; label: string; description: string }[] = [
    { value: 'coding', label: 'Coding/Development', description: 'Programming, web development, IDEs' },
    { value: 'gaming', label: 'Gaming', description: 'Gaming at 1440p or 4K' },
    { value: 'streaming', label: 'Streaming', description: 'Twitch/YouTube streaming' },
    { value: 'vtuber', label: 'VTuber Streaming', description: 'Avatar-based streaming' },
    { value: 'multitab', label: 'Multi-Tab Heavy Use', description: '50+ browser tabs, heavy multitasking' },
    { value: 'music', label: 'Music Production', description: 'DAW, audio editing, plugins' },
  ];

  const toggleUseCase = (useCase: UseCase) => {
    setState(prev => ({
      ...prev,
      useCases: prev.useCases.includes(useCase)
        ? prev.useCases.filter(u => u !== useCase)
        : [...prev.useCases, useCase],
    }));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : null;
    setState(prev => ({ ...prev, budget: value }));
  };

  const handleBudgetTypeChange = (type: BudgetType) => {
    setState(prev => ({ ...prev, budgetType: type }));
  };

  const handleStorageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : null;
    setState(prev => ({ ...prev, storageCapacity: value }));
  };

  const canProceedUseCases = state.useCases.length > 0;
  const canProceedBudget = state.budget !== null && state.budget > 0;
  const canProceedStorage = state.storageCapacity !== null && state.storageCapacity > 0;

  return (
    <div className="survey-container">
      <div className="survey-card">
        {step === 'usecases' && (
          <div className="survey-step">
            <h2>What will you use this PC for?</h2>
            <p className="subtitle">Select all that apply</p>
            
            <div className="checkbox-grid">
              {useCaseOptions.map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={state.useCases.includes(option.value)}
                    onChange={() => toggleUseCase(option.value)}
                    className="checkbox-input"
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-title">{option.label}</span>
                    <span className="checkbox-desc">{option.description}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                disabled={!canProceedUseCases}
                onClick={() => setStep('storage')}
              >
                Next: Storage
              </button>
            </div>
          </div>
        )}

        {step === 'storage' && (
          <div className="survey-step">
            <h2>How much storage do you need?</h2>
            <p className="subtitle">Total storage capacity for OS, apps, and files</p>

            <div className="input-group">
              <label htmlFor="storage">Storage Capacity</label>
              <div className="input-wrapper">
                <input
                  id="storage"
                  type="number"
                  min="256"
                  max="16000"
                  step="100"
                  value={state.storageCapacity || ''}
                  onChange={handleStorageChange}
                  placeholder="e.g., 512, 1000, 2000"
                  className="input-field"
                />
                <span className="unit">GB</span>
              </div>
              <div className="quick-buttons">
                {[
                  { value: 512, label: '512GB' },
                  { value: 1000, label: '1TB' },
                  { value: 2000, label: '2TB' },
                  { value: 4000, label: '4TB' }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`quick-btn ${state.storageCapacity === option.value ? 'active' : ''}`}
                    onClick={() => setState(prev => ({ ...prev, storageCapacity: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="help-text">💡 Minimum 256GB (OS + apps), 1TB recommended for gaming</p>
            </div>

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setStep('usecases')}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!canProceedStorage}
                onClick={() => setStep('features')}
              >
                Next: Features
              </button>
            </div>
          </div>
        )}

        {step === 'features' && (
          <div className="survey-step">
            <h2>What features do you need?</h2>
            <p className="subtitle">Select all that apply</p>

            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.needsWireless ?? false}
                  onChange={(e) => setState(prev => ({ ...prev, needsWireless: e.target.checked }))}
                  className="checkbox-input"
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">WiFi/Wireless</span>
                  <span className="checkbox-desc">Built-in WiFi or expansion card support</span>
                </div>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.needsExpansionSlots ?? false}
                  onChange={(e) => setState(prev => ({ ...prev, needsExpansionSlots: e.target.checked }))}
                  className="checkbox-input"
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Expansion Slots</span>
                  <span className="checkbox-desc">PCIe slots for WiFi, sound, or other cards</span>
                </div>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.needsSoundCard ?? false}
                  onChange={(e) => setState(prev => ({ ...prev, needsSoundCard: e.target.checked }))}
                  className="checkbox-input"
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Sound Card/Audio Interface</span>
                  <span className="checkbox-desc">For music production or streaming audio</span>
                </div>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={state.needsCaptureCard ?? false}
                  onChange={(e) => setState(prev => ({ ...prev, needsCaptureCard: e.target.checked }))}
                  className="checkbox-input"
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Capture Card</span>
                  <span className="checkbox-desc">For streaming console/external device content</span>
                </div>
              </label>
            </div>

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setStep('storage')}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep('budget')}
              >
                Next: Budget
              </button>
            </div>
          </div>
        )}

        {step === 'budget' && (
          <div className="survey-step">
            <h2>What's your budget?</h2>
            <p className="subtitle">Enter your budget in USD</p>

            <div className="input-group">
              <label htmlFor="budget">Total Budget</label>
              <div className="input-wrapper">
                <span className="currency">$</span>
                <input
                  id="budget"
                  type="number"
                  min="300"
                  max="10000"
                  step="50"
                  value={state.budget || ''}
                  onChange={handleBudgetChange}
                  placeholder="e.g., 500, 1000, 2000"
                  className="input-field"
                />
              </div>
              <div className="quick-buttons">
                {[500, 1000, 1500, 2000].map(amount => (
                  <button
                    key={amount}
                    className={`quick-btn ${state.budget === amount ? 'active' : ''}`}
                    onClick={() => setState(prev => ({ ...prev, budget: amount }))}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setStep('features')}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!canProceedBudget}
                onClick={() => setStep('os')}
              >
                Next: Operating System
              </button>
            </div>
          </div>
        )}

        {step === 'os' && (
          <div className="survey-step">
            <h2>What OS will you use?</h2>
            <p className="subtitle">Different OSes have different hardware requirements</p>

            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="os"
                  checked={state.operatingSystem === 'windows'}
                  onChange={() => setState(prev => ({ ...prev, operatingSystem: 'windows' }))}
                  className="radio-input"
                />
                <div className="radio-content">
                  <span className="radio-title">Windows</span>
                  <span className="radio-desc">
                    Standard hardware requirements, TPM 2.0 for Windows 11
                  </span>
                </div>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="os"
                  checked={state.operatingSystem === 'linux'}
                  onChange={() => setState(prev => ({ ...prev, operatingSystem: 'linux' }))}
                  className="radio-input"
                />
                <div className="radio-content">
                  <span className="radio-title">Linux (Arch, Ubuntu, Fedora)</span>
                  <span className="radio-desc">
                    Lower requirements, very compatible with most hardware
                  </span>
                </div>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="os"
                  checked={state.operatingSystem === 'macos'}
                  onChange={() => setState(prev => ({ ...prev, operatingSystem: 'macos' }))}
                  className="radio-input"
                />
                <div className="radio-content">
                  <span className="radio-title">macOS</span>
                  <span className="radio-desc">
                    Apple hardware only, optimized for MacBooks
                  </span>
                </div>
              </label>
            </div>

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setStep('budget')}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!state.operatingSystem}
                onClick={() => setStep('budgettype')}
              >
                Next: Budget Type
              </button>
            </div>
          </div>
        )}

        {step === 'budgettype' && (
          <div className="survey-step">
            <h2>Budget Type</h2>
            <p className="subtitle">How flexible is your budget?</p>

            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="budgetType"
                  checked={state.budgetType === 'strict'}
                  onChange={() => handleBudgetTypeChange('strict')}
                  className="radio-input"
                />
                <div className="radio-content">
                  <span className="radio-title">Strict Budget</span>
                  <span className="radio-desc">
                    Must not exceed budget at all
                  </span>
                </div>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="budgetType"
                  checked={state.budgetType === 'soft'}
                  onChange={() => handleBudgetTypeChange('soft')}
                  className="radio-input"
                />
                <div className="radio-content">
                  <span className="radio-title">Soft Budget</span>
                  <span className="radio-desc">
                    Can exceed budget if significantly better value (up to +10%)
                  </span>
                </div>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="budgetType"
                  checked={state.budgetType === 'flexible'}
                  onChange={() => handleBudgetTypeChange('flexible')}
                  className="radio-input"
                />
                <div className="radio-content">
                  <span className="radio-title">Flexible Budget</span>
                  <span className="radio-desc">
                    Can exceed budget for much better value (up to +20%)
                  </span>
                </div>
              </label>
            </div>

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setStep('budget')}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={onNext}
              >
                Get Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
