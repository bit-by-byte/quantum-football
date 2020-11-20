import React, { useState, useCallback, useMemo } from 'react';
import { Row, Col, Button, Frame, Heading, Blockquote } from 'arwes';
import _ from 'underscore';
import QuantumCircuit from 'quantum-circuit';

const MatchPrompt = ({globalState, setGlobalState, currentMatch, setCurrentMatch}) => {

  const [choiceA, setChoiceA] = useState(<></>);
  const [choiceB, setChoiceB] = useState(<></>);
  const [choiceC, setChoiceC] = useState(<></>);
  const [choiceD, setChoiceD] = useState(<></>);

  const [textPrompt, setTextPrompt] = useState("Please start the match");
  const [windSpeed, setWindSpeed] = useState(5);
  const [morale, setMorale] = useState(80);
  const [startedMatch, setStartedMatch] = useState(false);
  const [finishedMatch, setFinishedMatch] = useState(false);
  const [leagueOver, setLeagueOver] = useState(false);
  const [leagueMeasured, setLeagueMeasured] = useState(false);
  const [matchesPlayed, setMatchesPlayed] = useState(0);

  const SHOOT = 'shoot (NOT gate q0)';
  const PASS = 'short pass (pi/4 rot q0)';
  const DRIBBLE = 'dribble (pi/4 rot q1)';
  const CROSS = 'cross (swap q0 & q1)';
  const HEADER = 'header (pi/2 rot q0)';
  const ROULETTE = 'roulette (NOT gate q1)';
  const LONG_BALL = 'long ball (pi/2 rot q1)';
  const CLEARANCE = 'clearance (do nothing)';

  const choices = useMemo(() => [
    { prompt: "You're through on goal about 20m out but you've got a teammate to pass to. What do you do?", options: [SHOOT, PASS, DRIBBLE] },
    { prompt: "Your teammate's making a run through the middle. What do you do?", options: [PASS, ROULETTE, CROSS] },
    { prompt: "There's a defender between you and the goal. What do you do?", options: [PASS, DRIBBLE, ROULETTE, SHOOT] },
    { prompt: "There's two defenders between you and the goal. What do you do?", options: [PASS, DRIBBLE, ROULETTE, SHOOT] },
    { prompt: "You're the last man in defence and the ball falls to you. What do you do?", options: [CLEARANCE, LONG_BALL, PASS] },
    { prompt: "You're in defence and the ball flies towards you in the air at high speed. What do you do?", options: [HEADER, LONG_BALL, CLEARANCE] },
    { prompt: "You have the ball in midfield and three defenders are chasing you. What do you do?", options: [PASS, LONG_BALL, DRIBBLE] },
    { prompt: "You have the ball on the wing and nobody is near you. What do you do?", options: [PASS, ROULETTE, DRIBBLE, CROSS] },
    { prompt: "Your teammate sends a high ball to you while you're near the opponent's goal. What do you do?", options: [HEADER, PASS, SHOOT] },
    { prompt: "The goalkeeper takes a goal kick and the ball flies your way in midfield. What do you do?", options: [HEADER, PASS, CLEARANCE] },
  ], []);

  const startMatch = () => {
    console.log("startMatch");

    // Randomise environment
    const windSpeed_ = _.random(0, 20);
    const morale_ = _.random(0, 100);
    setWindSpeed(windSpeed_);
    setMorale(morale_);

    // Store previous match
    if(matchesPlayed > 0){
      let globalState_ = globalState;
      globalState_.matches[matchesPlayed - 1] = currentMatch;
      
      globalState_.otherMatches[matchesPlayed - 1].teamAScore = _.random(0,4);
      globalState_.otherMatches[matchesPlayed - 1].teamBScore = _.random(0,4);
      globalState_.otherMatches[matchesPlayed - 1].measured = true;

      setGlobalState(globalState_);
    }

    // Get next match
    let matchToPlay = globalState.matches[matchesPlayed];
    matchToPlay.teamBScore = _.random(0, 2); // Set random value (0-2) for other team's score
    
    // Initialise circuit with environment
    let circuit = new QuantumCircuit();
    circuit.appendGate("rx", 0, {
        params: {
            theta: morale_ + "*pi/100" 
        }
    });
    circuit.appendGate("rx", 1, {
        params: {
            theta: windSpeed_ + "*pi/20" 
        }
    });

    circuit.run();
    matchToPlay.circuit = circuit;
    matchToPlay.q0Angle = morale_ * Math.PI/100;
    matchToPlay.q1Angle = windSpeed_ * Math.PI/20;

    setCurrentMatch(matchToPlay);
    setFinishedMatch(false);
    setStartedMatch(true);

    // Generate first prompt
    generatePrompt(0, circuit, matchToPlay);
  };

  const endMatch = (matchesPlayed_) => {
    console.log("Match ended");
    console.log("Matches played = " + matchesPlayed_);
    setFinishedMatch(true);

    let matchOverPrompt = "Final whistle blown. The match is over."

    if(matchesPlayed_ > 2){
      setLeagueOver(true);
      matchOverPrompt = "Final whistle blown. The match and league are over."
    }

    setTextPrompt(matchOverPrompt);
    setMatchesPlayed(matchesPlayed_);

    setChoiceA(<></>);
    setChoiceB(<></>);
    setChoiceC(<></>);
    setChoiceD(<></>);
    
  };

  const measureLeague = () => {
    console.log("measureLeague");

    let globalState_ = globalState;

    // Calculate other teams scores
    for (let i = 0; i < 3; i++) {      
      if(globalState_.otherMatches[i].teamAScore > globalState_.otherMatches[i].teamBScore){
        globalState_.teams[globalState_.otherMatches[i].teamA].points += 3;
      }
      else if(globalState_.otherMatches[i].teamAScore < globalState_.otherMatches[i].teamBScore){
        globalState_.teams[globalState_.otherMatches[i].teamB].points += 3;
      }
      else{
        globalState_.teams[globalState_.otherMatches[i].teamA].points += 1;
        globalState_.teams[globalState_.otherMatches[i].teamB].points += 1;
      }
    }

    // Calculate own team's score
    for (let i = 0; i < 3; i++) {
      let qubit0 = globalState_.matches[i].circuit.measure(0);      
      let qubit1 = globalState_.matches[i].circuit.measure(1);
      let ourScore = 2*qubit1 + qubit0;
      globalState_.matches[i].teamAScore = ourScore;

      if(globalState_.matches[i].teamAScore > globalState_.matches[i].teamBScore){
        globalState_.teams[globalState_.matches[i].teamA].points += 3;
      }
      else if(globalState_.matches[i].teamAScore < globalState_.matches[i].teamBScore){
        globalState_.teams[globalState_.matches[i].teamB].points += 3;
      }
      else{
        globalState_.teams[globalState_.matches[i].teamA].points += 1;
        globalState_.teams[globalState_.matches[i].teamB].points += 1;
      }
    }

    setGlobalState({...globalState_, measureLeague: true});

    setLeagueMeasured(true);
  };

  const generatePrompt = useCallback((promptNum, currentCircuit, currentMatch) => {
    console.log("generatePrompt");
    if(promptNum > 4 || leagueOver){
      endMatch(matchesPlayed + 1);
      return;
    }
    // Choose random text
    const choice = choices[_.random(0, choices.length-1)];

    // Set appropriate button choices
    let cButtons = [<></>,<></>,<></>,<></>];
    for (let i = 0; i < choice.options.length; i++) {
      cButtons[i] = <Button animate layer='success' onClick={(ev) => {chooseAction(choice.options[i], promptNum, currentCircuit, currentMatch)}}>{choice.options[i]}</Button>;
    }

    setTextPrompt(choice.prompt);

    setChoiceA(cButtons[0]);
    setChoiceB(cButtons[1]);
    setChoiceC(cButtons[2]);
    setChoiceD(cButtons[3]);

  }, // eslint-disable-next-line
  [choices, endMatch, leagueOver]);

  const proceedButton = () => {
    if(leagueMeasured)
      return <Button animate layer='success' onClick={(ev) => {window.location.reload()}}>Restart Game</Button>;
    else if(leagueOver)
      return <Button animate layer='success' onClick={(ev) => {measureLeague()}}>Measure League</Button>;
    else if(!startedMatch && !finishedMatch)
      return <Button animate layer='success' onClick={(ev) => {startMatch()}}>Start League</Button>;
    else if(startedMatch && finishedMatch)
      return <Button animate layer='success' onClick={(ev) => {startMatch()}}>Next Match</Button>;
    else
      return <></>;
  };

  const chooseAction = (currentChoice, promptNum, currentCircuit, currentMatch) => {
    console.log("Processing choice");

    let q0Angle_ = currentMatch.q0Angle;
    let q1Angle_ = currentMatch.q1Angle;

    // Modify circuit
    switch(currentChoice) {
      case SHOOT:
        currentCircuit.appendGate("x", 0);
        q0Angle_ += Math.PI;
        break;
      case PASS:
        currentCircuit.appendGate("rx", 0, {
          params: {
              theta: "pi/4" 
          }
        });
        q0Angle_ += Math.PI/4;
        break;
      case DRIBBLE:
        currentCircuit.appendGate("rx", 1, {
          params: {
              theta: "pi/4" 
          }
        });
        q1Angle_ += Math.PI/4;
        break;
      case CROSS:
        currentCircuit.appendGate("swap", [0, 1]);
        let tmp = q0Angle_;
        q0Angle_ = q1Angle_;
        q1Angle_ = tmp;
        break;
      case HEADER:
        currentCircuit.appendGate("rx", 0, {
          params: {
              theta: "pi/2" 
          }
        });
        q0Angle_ += Math.PI/2;
        break;
      case ROULETTE:
        currentCircuit.appendGate("x", 1);
        q1Angle_ += Math.PI;
        break;
      case LONG_BALL:
        currentCircuit.appendGate("rx", 1, {
          params: {
              theta: "pi/2" 
          }
        });
        q1Angle_ += Math.PI/2;
        break;
      case CLEARANCE:
        // do nothing
        break;
      default:
        // do nothing
    }  
    
    currentCircuit.run();
    setCurrentMatch({...currentMatch, circuit: currentCircuit, q0Angle: q0Angle_, q1Angle: q1Angle_});

    currentMatch.q0Angle = q0Angle_;
    currentMatch.q1Angle = q1Angle_;

    // On choice button click generate a new prompt for next choice
    generatePrompt(promptNum+1, currentCircuit, currentMatch);

  };

  return (
    <>
      <div style={{ padding: 20 }}>
        <Frame animate level={1} corners={0}>
          <Row>
            <Col s={12} m={4}>
              Wind speed: <b>{windSpeed}mph</b><br/>
              Team morale: <b>{morale}/100</b><br/>
            </Col>
            <Col s={12} m={8}>
              <Heading node='h5'>{globalState.teams[currentMatch.teamA].name} v {globalState.teams[currentMatch.teamB].name}</Heading>
              <p>Goals needed to win: <b>{currentMatch.teamBScore + 1}</b></p>
              <Blockquote data-layer='success'>
                {textPrompt}
              </Blockquote>
              {proceedButton()}
            </Col>
          </Row>
        </Frame>
      </div>
      <div style={{ padding: 20 }}>
        <Row>
          <Col s={6} m={3}>
            <div style={{ padding: 10 }}>
              {choiceA}
            </div>
          </Col>
          <Col s={6} m={3}>
            <div style={{ padding: 10 }}>
              {choiceB}
            </div>
          </Col>
          <Col s={6} m={3}>
            <div style={{ padding: 10 }}>
              {choiceC}
            </div>
          </Col>
          <Col s={6} m={3}>
            <div style={{ padding: 10 }}>
              {choiceD}
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default MatchPrompt;