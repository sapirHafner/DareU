<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import React from "react";
=======
import React, { useState, useMemo } from "react";
>>>>>>> feature/all-features-no-auth

const LifeCalendarSection = () => {
  const [birthDate, setBirthDate] = useState(() => {
    const saved = localStorage.getItem('user_birth_date');
    return saved || '';
  });
  const [gender, setGender] = useState(() => {
    const saved = localStorage.getItem('user_gender');
    return saved || '';
  });
  const [showSurveyData, setShowSurveyData] = useState(true);

  const data = useMemo(() => {
    if (!birthDate || !gender) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    
    if (birth > today) return null;
    
    const currentAge = today.getFullYear() - birth.getFullYear();
    const currentMonth = today.getMonth();
    const birthMonth = birth.getMonth();
    
    const monthsPassed = (currentAge * 12) + (currentMonth - birthMonth);
    
    const getLifeExpectancy = (genderValue) => {
      switch(genderValue) {
        case 'female': return 80;
        case 'male': return 76;
        case 'other': return 78;
        case 'prefer_not_to_say': return 78;
        default: return 78;
      }
    };
    
    const lifeExpectancy = getLifeExpectancy(gender);
    const totalMonths = lifeExpectancy * 12;
    
    const months = [];
    for (let i = 0; i < totalMonths; i++) {
      const monthDate = new Date(birth.getFullYear(), birth.getMonth() + i, 1);
      const isPassed = i < monthsPassed;
      const isCurrent = i === monthsPassed;
      
      months.push({
        index: i,
        isPassed,
        isCurrent,
        year: Math.floor(i / 12),
        month: i % 12,
        date: monthDate
      });
    }
    
    return {
      months,
      monthsPassed,
      totalMonths,
      lifeExpectancy,
      yearsLived: Math.floor(monthsPassed / 12),
      monthsInCurrentYear: monthsPassed % 12,
      weeksLived: Math.floor(monthsPassed * 4.33),
      percentComplete: ((monthsPassed / totalMonths) * 100).toFixed(1),
      monthsRemaining: totalMonths - monthsPassed,
      yearsRemaining: Math.floor((totalMonths - monthsPassed) / 12)
    };
  }, [birthDate, gender]);

  const handleBirthDateChange = (date) => {
    setBirthDate(date);
    localStorage.setItem('user_birth_date', date);
  };

  const handleGenderChange = (selectedGender) => {
    setGender(selectedGender);
    localStorage.setItem('user_gender', selectedGender);
  };

  const getMotivationalMessage = () => {
    if (!data) return "";
    
    const messages = [
      `You've lived ${data.yearsLived} beautiful years - every new day is an opportunity to grow`,
      `${data.monthsPassed} months of life behind you - it's time to make the next ones more meaningful`,
      `${data.weeksLived} weeks have passed since you were born - every new week is a new page`,
      `At age ${data.yearsLived}, you're in the perfect place to start something new`,
      `All the months that have passed brought you here - now it's time to aim for your new goals`
    ];
    
    return messages[data.monthsPassed % messages.length];
  };

  const getMonthColor = (month) => {
    if (month.isCurrent) return '#ff6b6b';
    if (month.isPassed) return '#4ecdc4';
    return '#e0e0e0';
  };

  const createYearColumns = () => {
    const yearColumns = [];
    const yearsToShow = data.lifeExpectancy;
    
    for (let yearIndex = 0; yearIndex < yearsToShow; yearIndex++) {
      const yearMonths = [];
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthData = data.months[yearIndex * 12 + monthIndex];
        yearMonths.push(monthData);
      }
      
      const yearColumn = {
        yearNumber: yearIndex,
        rows: [
          yearMonths.slice(0, 4),
          yearMonths.slice(4, 8),
          yearMonths.slice(8, 12)
        ]
      };
      yearColumns.push(yearColumn);
    }
    
    return yearColumns;
  };

  if (!birthDate || !gender) {
    return (
      <div style={{ 
        marginTop: "2rem", 
        padding: "1.5rem", 
        background: "#ffa366", 
        color: "white",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 4px 15px rgba(255,163,102,0.3)"
      }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem" }}>Your Life Calendar</h3>
        <p style={{ marginBottom: "1rem", opacity: "0.9" }}>
          Enter your details to see your life journey so far
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Birth Date:</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Gender:</label>
            <select
              value={gender}
              onChange={(e) => handleGenderChange(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem",
                background: "white",
                color: "#8B4513",
                cursor: "pointer",
                minWidth: "150px"
              }}
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {gender && (
              <div style={{ fontSize: "0.8rem", marginTop: "0.3rem", opacity: "0.9" }}>
                Life expectancy: {gender === 'female' ? '80' : gender === 'male' ? '76' : '78'} years
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ 
        marginTop: "2rem", 
        padding: "1.5rem", 
        background: "#ffb380", 
        borderRadius: "12px",
        textAlign: "center",
        boxShadow: "0 4px 15px rgba(255,179,128,0.3)"
      }}>
        <p style={{ color: "#8B4513", marginBottom: "1rem" }}>Invalid birth date. Please check and try again.</p>
        <button 
          onClick={() => {
            handleBirthDateChange('');
            handleGenderChange('');
          }}
          style={{
            padding: "0.5rem 1rem",
            background: "#cd853f",
            color: "white",
            border: "none",
            borderRadius: "6px",
            marginTop: "0.5rem",
            cursor: "pointer"
          }}
        >
          Reset Details
        </button>
      </div>
    );
  }

  const yearColumns = createYearColumns();

  return (
    <div style={{ marginTop: "2rem" }}>
      {showSurveyData && window.surveyAnswers && (
        <div style={{ 
          marginBottom: "1.5rem", 
          padding: "1rem", 
          background: "#ffb366", 
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(255,179,102,0.3)",
          position: "relative"
        }}>
          <button
            onClick={() => setShowSurveyData(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "15px",
              background: "rgba(139,69,19,0.8)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "25px",
              height: "25px",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Hide survey data"
          >
            ×
          </button>
          <h3 style={{ color: "#8B4513", margin: "0 0 1rem 0" }}>Your Survey Results:</h3>
          <p style={{ color: "#8B4513", margin: "0.5rem 0" }}>
            <strong>Topics:</strong> {window.surveyAnswers.selectedTopics?.join(", ") || "Not specified"}
          </p>
          <p style={{ color: "#8B4513", margin: "0.5rem 0" }}>
            <strong>Primary Motivation:</strong> {window.surveyAnswers.primaryMotivation || "Not specified"}
          </p>
          <p style={{ color: "#8B4513", margin: "0.5rem 0" }}>
            <strong>Generated Questions:</strong> {(window.generatedQuestions?.questions?.length || 0)}
          </p>
        </div>
      )}

      <div style={{ 
        padding: "1.5rem", 
        background: "#ff9966", 
        color: "white",
        borderRadius: "12px",
        marginBottom: "1.5rem",
        textAlign: "center",
        boxShadow: "0 4px 15px rgba(255,153,102,0.3)"
      }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem" }}>Your Life Journey</h3>
        <p style={{ 
          fontSize: "1rem", 
          marginBottom: "1rem", 
          fontWeight: "500",
          lineHeight: "1.4"
        }}>
          {getMotivationalMessage()}
        </p>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "0.8rem",
          marginTop: "1rem",
          fontSize: "0.85rem"
        }}>
          <div style={{ background: "#ffa366", padding: "0.6rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{data.yearsLived}</div>
            <div>Years Lived</div>
          </div>
          <div style={{ background: "#ffa366", padding: "0.6rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{data.yearsRemaining}</div>
            <div>Years Left</div>
          </div>
          <div style={{ background: "#ffa366", padding: "0.6rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{data.monthsPassed}</div>
            <div>Months Passed</div>
          </div>
          <div style={{ background: "#ffa366", padding: "0.6rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{data.monthsRemaining}</div>
            <div>Months Left</div>
          </div>
          <div style={{ background: "#ffa366", padding: "0.6rem", borderRadius: "6px" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{data.percentComplete}%</div>
            <div>Complete</div>
          </div>
        </div>
        
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "0.9rem", marginRight: "0.5rem" }}>Birth date:</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                border: "none",
                fontSize: "0.9rem"
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.9rem", marginRight: "0.5rem" }}>Gender:</label>
            <select
              value={gender}
              onChange={(e) => handleGenderChange(e.target.value)}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                border: "none",
                fontSize: "0.8rem",
                background: "white",
                color: "#8B4513",
                cursor: "pointer"
              }}
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ 
        background: "#ffcc99", 
        padding: "1.5rem", 
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(255,204,153,0.3)"
      }}>
        <h4 style={{ 
          textAlign: "center", 
          marginBottom: "1rem",
          color: "#8B4513",
          fontSize: "1.2rem"
        }}>
          Each circle = one month | Each column = one year
        </h4>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "1.5rem",
          marginBottom: "1.5rem",
          fontSize: "0.85rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ecdc4" }}></div>
            <span style={{ color: "#8B4513" }}>Past</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff6b6b" }}></div>
            <span style={{ color: "#8B4513" }}>Now</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e0e0e0" }}></div>
            <span style={{ color: "#8B4513" }}>Future</span>
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "8px",
          justifyContent: "flex-start",
          maxWidth: "100%"
        }}>
          {yearColumns.map((yearColumn, yearIndex) => (
            <div key={yearIndex} style={{ 
              display: "flex", 
              flexDirection: "column",
              alignItems: "center",
              gap: "2px"
            }}>
              <div style={{
                fontSize: "0.6rem",
                color: "#8B4513",
                marginBottom: "2px",
                height: "12px",
                lineHeight: "12px"
              }}>
                {yearColumn.yearNumber}
              </div>
              
              {yearColumn.rows.map((row, rowIndex) => (
                <div key={rowIndex} style={{ 
                  display: "flex", 
                  gap: "1px",
                  marginBottom: "1px"
                }}>
                  {row.map((monthData, monthIndex) => {
                    if (!monthData) {
                      return (
                        <div 
                          key={monthIndex} 
                          style={{ 
                            width: "8px", 
                            height: "8px",
                            margin: "0"
                          }}
                        />
                      );
                    }
                    
                    return (
                      <div
                        key={monthIndex}
                        title={`Year ${yearColumn.yearNumber}, Month ${(rowIndex * 4) + monthIndex + 1}`}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: getMonthColor(monthData),
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          border: monthData.isCurrent ? "1px solid #d2691e" : "none"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "scale(1.3)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div style={{ 
          textAlign: "center", 
          marginTop: "1rem", 
          fontSize: "0.75rem", 
          color: "#8B4513",
          fontStyle: "italic"
        }}>
          Each column = one year (12 months) • Current age: {data.yearsLived} years • Scroll down to see more years
          <br />
          <span style={{ fontSize: "0.7rem", opacity: "0.8" }}>
            * Life expectancy based on global average: Women 80 years, Men 76 years, Other/Prefer not to say 78 years
          </span>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const payload = window.generatedQuestions || {};
  const surveyData = window.surveyAnswers || null;
  const [showSurveyData, setShowSurveyData] = useState(true);

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "800px", 
      margin: "0 auto",
      background: "#ffe6cc",
      minHeight: "100vh"
    }}>
      <h1 style={{ color: "#8B4513" }}>Welcome</h1>
      
      {surveyData && showSurveyData && (
        <div style={{ 
          marginBottom: "2rem", 
          padding: "1rem", 
          background: "#ffb366", 
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(255,179,102,0.3)",
          position: "relative"
        }}>
          <button
            onClick={() => setShowSurveyData(false)}
            style={{
              position: "absolute",
              top: "8px",
              right: "12px",
              background: "rgba(139,69,19,0.8)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              cursor: "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Hide survey data"
          >
            ×
          </button>
          <h3 style={{ color: "#8B4513", margin: "0 0 0.8rem 0", fontSize: "1.1rem" }}>Your Survey Results</h3>
          <div style={{ fontSize: "0.85rem", color: "#8B4513", lineHeight: "1.4" }}>
            <p style={{ margin: "0.3rem 0" }}><strong>Topics:</strong> {surveyData.selectedTopics?.join(", ")}</p>
            <p style={{ margin: "0.3rem 0" }}><strong>Motivation:</strong> {surveyData.primaryMotivation}</p>
            <p style={{ margin: "0.3rem 0" }}><strong>Questions Generated:</strong> {payload.questions?.length || 0}</p>
          </div>
        </div>
      )}

      <LifeCalendarSection />
    </div>
  );
}