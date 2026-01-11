import React from 'react';
import type { Recommendation, UseCase } from '../types';

const formatCapacity = (capacity: unknown): string => {
  const capacityNum = typeof capacity === 'number' ? capacity : parseInt(String(capacity), 10);
  if (isNaN(capacityNum)) return '0GB';
  
  if (capacityNum >= 1024) {
    const tb = capacityNum / 1024;
    return Number.isInteger(tb) ? `${tb}TB` : `${(capacityNum / 1024).toFixed(1)}TB`;
  }
  return `${capacityNum}GB`;
};

interface RecommendationsProps {
  recommendations: Recommendation[];
  useCases: UseCase[];
  surveyState: any;
  onBack: () => void;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  useCases,
  surveyState,
  onBack,
}) => {
  const handleShareAll = () => {
    // Create share data with complete survey state
    const shareData = {
      useCases: useCases,
      budget: surveyState.budget,
      budgetType: surveyState.budgetType,
      builds: recommendations.map((rec) => ({
        cpu: rec.cpu.id,
        gpu: rec.gpu?.id || null,
        ram: rec.ram.id,
        motherboard: rec.motherboard.id,
        psu: rec.psu.id,
        storage: rec.storage.id,
        cooler: rec.cooler.id,
        case: rec.case.id,
      })),
    };

    // Encode as URL search params
    const encodedData = encodeURIComponent(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;

    // Try native Share API first (mobile)
    if (navigator.share && navigator.canShare?.({ url: shareUrl })) {
      navigator.share({
        title: 'PC Builds - All Recommendations',
        text: `Check out these ${recommendations.length} PC build${recommendations.length !== 1 ? 's' : ''} I found!`,
        url: shareUrl,
      }).catch(err => console.log('Share error:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        // If clipboard fails, show the link in an alert
        alert(`Share this link:\n\n${shareUrl}`);
      });
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-container">
        <div className="no-results">
          <h2>No Recommendations Available</h2>
          <p>
            Unfortunately, no build configurations fit your criteria. Try increasing
            your budget or adjusting your requirements.
          </p>
          <button className="btn btn-primary" onClick={onBack}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <div className="header-content">
          <h2>PC Build Recommendations</h2>
          <p className="recommendation-count">{recommendations.length} build{recommendations.length !== 1 ? 's' : ''} recommended</p>
        </div>
        <div className="header-buttons">
          <button 
            className="btn btn-share"
            onClick={handleShareAll}
            title="Share all builds"
          >
            📤 Share All Builds
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            Modify Survey
          </button>
        </div>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="recommendation-card">
            <div className="card-header">
              <div className="card-title-section">
                <h3>Build Option {idx + 1}</h3>
              </div>
              <div className="price-badge">${rec.totalPrice}</div>
            </div>

            {!rec.compatibility.compatible && (
              <div className="warning-box">
                <h4>⚠️ Compatibility Warnings</h4>
                <ul>
                  {rec.compatibility.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="parts-grid">
              <PartItem
                label="CPU"
                part={rec.cpu}
                specs={{
                  cores: rec.cpu.specs.cores,
                  threads: rec.cpu.specs.threads,
                }}
              />
              {rec.gpu && rec.gpu.id !== 'gpu-integrated' && (
                <PartItem 
                  label="GPU" 
                  part={rec.gpu}
                  explanation="Discrete graphics for better performance"
                  specs={{
                    memory: `${rec.gpu.specs.memory}GB`,
                    power: `${rec.gpu.specs.power}W`,
                  }}
                />
              )}
              {rec.gpu?.id === 'gpu-integrated' && (
                <PartItem 
                  label="GPU" 
                  part={rec.gpu}
                  explanation="CPU has integrated graphics (no separate GPU needed)"
                />
              )}
              <PartItem 
                label="RAM" 
                part={rec.ram}
                specs={{
                  capacity: formatCapacity(rec.ram.specs.capacity),
                  speed: `${rec.ram.specs.speed}MHz`,
                }}
              />
              <PartItem 
                label="Motherboard" 
                part={rec.motherboard}
                specs={{
                  socket: rec.motherboard.specs.socket,
                  wifi: rec.motherboard.specs.wifi ? 'Yes' : 'No',
                }}
              />
              <PartItem 
                label="PSU" 
                part={rec.psu}
                specs={{
                  wattage: `${rec.psu.specs.wattage}W`,
                  efficiency: rec.psu.specs.efficiency,
                }}
              />
              <PartItem 
                label="Storage" 
                part={rec.storage}
                specs={{
                  capacity: formatCapacity(rec.storage.specs.capacity),
                  type: rec.storage.specs.type,
                }}
              />
              <PartItem 
                label="Cooler" 
                part={rec.cooler}
                explanation={rec.cooler.price === 0 ? "Stock cooler included with CPU" : undefined}
                specs={{
                  type: rec.cooler.specs.type,
                }}
              />
              <PartItem 
                label="Case" 
                part={rec.case}
                specs={{
                  formFactor: rec.case.specs.formFactor,
                  airflow: rec.case.specs.airflow,
                }}
              />
            </div>

            <div className="scores-section">
              <h4>Performance Scores</h4>
              <div className="scores-grid">
                {useCases.map(useCase => (
                  <div key={useCase} className="score-item">
                    <div className="score-label">
                      {useCase.charAt(0).toUpperCase() + useCase.slice(1)}
                    </div>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${((rec.scores[useCase] || 0) / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="score-value">{rec.scores[useCase]?.toFixed(1)}/10</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="breakdown">
              <h4>Price Breakdown</h4>
              <div className="breakdown-items">
                <BreakdownItem label="CPU" price={rec.cpu.price} total={rec.totalPrice} />
                {rec.gpu && <BreakdownItem label="GPU" price={rec.gpu.price} total={rec.totalPrice} />}
                <BreakdownItem label="RAM" price={rec.ram.price} total={rec.totalPrice} />
                <BreakdownItem label="Motherboard" price={rec.motherboard.price} total={rec.totalPrice} />
                <BreakdownItem label="PSU" price={rec.psu.price} total={rec.totalPrice} />
                <BreakdownItem label="Storage" price={rec.storage.price} total={rec.totalPrice} />
                <BreakdownItem label="Cooler" price={rec.cooler.price} total={rec.totalPrice} />
                <BreakdownItem label="Case" price={rec.case.price} total={rec.totalPrice} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PartItemProps {
  label: string;
  part: { name: string; price: number; specs: Record<string, string | number | boolean> };
  explanation?: string;
  specs?: Record<string, string | number | boolean>;
}

const PartItem: React.FC<PartItemProps> = ({ label, part, explanation, specs }) => {
  const priceDisplay = part.price === 0 ? 'N/A' : `$${part.price}`;
  const displaySpecs = specs || part.specs;
  
  return (
    <div className="part-item">
      <div className="part-label">{label}</div>
      <div className="part-name">{part.name}</div>
      <div className="part-price">{priceDisplay}</div>
      {explanation && <div className="part-explanation">{explanation}</div>}
      <div className="part-specs">
        {Object.entries(displaySpecs)
          .map(([key, value]) => (
            <span key={key} className="spec-tag">
              <strong>{key}:</strong> {value}
            </span>
          ))}
      </div>
    </div>
  );
};

interface BreakdownItemProps {
  label: string;
  price: number;
  total: number;
}

const BreakdownItem: React.FC<BreakdownItemProps> = ({ label, price, total }) => {
  if (price === 0) return null;
  const percentage = (price / total) * 100;
  return (
    <div className="breakdown-item">
      <span className="breakdown-label">{label}</span>
      <div className="breakdown-bar">
        <div
          className="breakdown-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="breakdown-amount">${price} ({percentage.toFixed(0)}%)</span>
    </div>
  );
};
