import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, Arwes, Row, Col, SoundsProvider, createSounds, Frame, Header, Heading, Table } from 'arwes';
import _ from 'underscore';
import Chart from "react-apexcharts";
import  {drawBloch0, drawBloch1} from './Charts';

import MatchPrompt from './MatchPrompt';

import clickSound from './sounds/click.mp3';
import typingSound from './sounds/typing.mp3';
import deploySound from './sounds/deploy.mp3';

const mySounds = {
  shared: { volume: 1, },  // Shared sound settings
  players: {  // The player settings
    click: {  // With the name the player is created
      sound: { src: clickSound }  // The settings to pass to Howler
    },
    typing: {
      sound: { src: typingSound },
      settings: { oneAtATime: true }  // The custom app settings
    },
    deploy: {
      sound: { src: deploySound },
      settings: { oneAtATime: true }
    },
  }
};

const App = () => {
  const [globalState, setGlobalState] = useState({
    teams: [
      {name: 'QFC', position: "superposition", points: 0},
      {name: 'Derby Quanty', position: "superposition", points: 0},
      {name: 'Quantelona', position: "superposition", points: 0},
      {name: 'Quanter Milan', position: "superposition", points: 0}
    ],
    matches: [
      {teamA : 0, teamB : 1, measured : false, circuit: {}, q0Angle: 0, q1Angle: 0, teamAScore: 0, teamBScore: 0},
      {teamA : 0, teamB : 2, measured : false, circuit: {}, q0Angle: 0, q1Angle: 0, teamAScore: 0, teamBScore: 0},
      {teamA : 0, teamB : 3, measured : false, circuit: {}, q0Angle: 0, q1Angle: 0, teamAScore: 0, teamBScore: 0},
    ],
    otherMatches: [
      {teamA : 2, teamB : 3, measured : false, teamAScore: 0, teamBScore: 0},
      {teamA : 1, teamB : 3, measured : false, teamAScore: 0, teamBScore: 0},
      {teamA : 1, teamB : 2, measured : false, teamAScore: 0, teamBScore: 0},
    ],
    measureLeague: false
  });

  const [currentMatch, setCurrentMatch] = useState({
    teamA : 0, teamB : 1, played : false, measured : false, circuit: {}, teamAScore: 0, teamBScore: 0
  });

  const [chartState, setChartState] = useState({});
  const [chartSeries, setChartSeries] = useState([]);
  const [leaguePositions, setLeaguePositions] = useState([]);
  const [results, setResults] = useState([]);
  const [titleText, setTitleText] = useState(<Heading node='h1'>Quantum Football</Heading>);

  function drawApexChart(circuit) {
    if (_.isEmpty(circuit))
      return;
  
    let state = circuit.stateAsString(false);
    if (_.isEmpty(state))
      return;
  
    let pairs = state.split("i");
    if (_.isEmpty(pairs))
      return;
  
    pairs.splice(0, 1);
  
    let values = [];
    let probs = [];
    pairs.forEach(function (item, index) {
      let pair = item.split('%')[0].split(" ");
      values.splice(index, 0, pair[0].trim() + " (" + index + ")");
      probs.splice(index, 0, pair.slice(-1)[0].trim());
    });
  
    if (_.isEmpty(values))
      return;
  
    let options = {
      chart: {
        type: 'bar',
        toolbar: {
          show: false
        }
      },
      title: {
        text: "Score Probability",
        align: 'center',
        style: {
          color: "#FFFFFF"
        }
      },
      grid: {
        show: false,
      },
      yaxis: {
        show: false,
      },
      xaxis: {
        categories: values,
        labels: {
          style : {
            colors : "#FFFFFF"
          }
        }
      },
    }

    let series = [{
        name: 'probability (%)',
        data: probs
      }];

    setChartState(options);
    setChartSeries(series);
  }

  useEffect(() => {
    if(_.isEmpty(currentMatch.circuit))
      return;

    drawBloch0(currentMatch.circuit, currentMatch.q0Angle);
    drawBloch1(currentMatch.circuit, currentMatch.q1Angle);

    drawApexChart(currentMatch.circuit);
  }, [currentMatch.circuit, currentMatch.q0Angle, currentMatch.q1Angle]);

  useEffect(() => {
    if(!globalState.measureLeague){
      setLeaguePositions(globalState.teams.map((team) => [team.name, team.position, team.points]));
      return;
    }

    let results_ = [];
    globalState.matches.forEach(function (match, index) {
      results_[index] = [globalState.teams[match.teamA].name, globalState.teams[match.teamB].name, match.teamAScore + "-" + match.teamBScore]
    });
    globalState.otherMatches.forEach(function (match, index) {
      results_[globalState.matches.length + index] = [globalState.teams[match.teamA].name, globalState.teams[match.teamB].name, match.teamAScore + "-" + match.teamBScore]
    });

    setResults(results_);

    globalState.teams.sort((a, b) => b.points - a.points);
    globalState.teams.forEach(function (team, index) {
      if(index === 0)
        team.position = "1st"
      else if(index === 1)
        team.position = "2nd"
      else if(index === 2)
        team.position = "3rd"
      else if(index === 3)
        team.position = "4th"
      else
        team.position = index + 1;

      if(team.name === "QFC"){
        if(index === 0)
          setTitleText(<Heading node='h1' style={{color: "Chartreuse"}}>Congratulations! You won!</Heading>);
        else
          setTitleText(<Heading node='h1' style={{color: "#ccff00"}}>{"You came " + team.position + "... Better luck next time!"}</Heading>)
      }
    });
    
    setLeaguePositions(globalState.teams.map((team) => [team.name, team.position, team.points]));
  }, [globalState.measureLeague, globalState.teams, globalState.matches, globalState.otherMatches]);

  return (
  <ThemeProvider theme={createTheme()}>
    <SoundsProvider sounds={createSounds(mySounds)}>
      <Arwes show>
        <div style={{ padding: 20 }}>
          <Header >
            {titleText}
          </Header>
        </div>
        <div style={{ padding: 20 }}>
          <Frame level={1} corners={3}>
            <Row>

              <Col s={12} m={4}>
                <div style={{ padding: 20 }}>
                  <div style={{ padding: 10 }}>
                    <Heading node='h3'>League Table</Heading>
                    <Table
                      
                      headers={['Team', 'League Position', 'Points']}
                      dataset={leaguePositions}
                    />
                  </div>
                </div>
                {
                  _.isEmpty(results) ? <></>
                  :
                  <>
                  <div style={{ padding: 20 }}>
                    <div style={{ padding: 10 }}>
                    <Heading node='h5'>Results</Heading>
                    <Table
                      
                      dataset={results}
                    />
                    </div>
                  </div>
                  </>
                }
              </Col>

              <Col s={12} m={8}>
                <MatchPrompt globalState={globalState} setGlobalState={setGlobalState} currentMatch={currentMatch} setCurrentMatch={setCurrentMatch} />
              </Col>

            </Row>
          </Frame>
        </div>

        <div style={{ padding: 20 }}>
          <Frame  level={3} corners={3}>
            <Row>
              <Col s={12} m={12}><Heading node='h3'>Quantum Info</Heading></Col>
            </Row>
            <Row>
              <Col s={12} m={4}>
                {
                  _.isEmpty(chartState)
                  ? <></>
                  : <Chart
                      options={chartState}
                      series={chartSeries}
                      type="bar"
                      width="300px"
                    />
                }
              </Col>
              <Col s={12} m={8}>
                {
                  _.isEmpty(currentMatch.circuit) 
                  ? <>Waiting for match start...</>
                  : <div style={{backgroundColor: "#AAAAAA"}} dangerouslySetInnerHTML={{__html : currentMatch.circuit.exportSVG(true)}} />
                }
              </Col>
            </Row>
            <Row>
              {
                _.isEmpty(currentMatch.circuit) 
                ? <></>
                :
                <>
                  <Col s={6} m={2}>
                    <p style={{textAlign: "center", width:"150px"}}>q1</p>
                    <canvas id="bloch1" width="150" height="150"></canvas>
                  </Col>
                  <Col s={6} m={2}>
                    <p style={{textAlign: "center", width:"150px"}}>q0</p>
                    <canvas id="bloch0" width="150" height="150"></canvas>
                  </Col>
                  <Col s={0} m={8}></Col>
                </>
              }
            </Row>
          </Frame>
        </div>
      </Arwes>
    </SoundsProvider>
  </ThemeProvider>
)};

export default App;
