/*global kakao*/
import React, { useCallback, useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import "./App.css";




//test

  const SearchData = [
    { routeName: "경부선", direction: ["부산", "서울"] },
    { routeName: "광주대구ㆍ무안광주선", direction: ["대구", "무안"] },
    { routeName: "남해선", direction: ["부산", "순천"] },
    { routeName: "남해제2지선", direction: ["냉정", "부산"] },
    { routeName: "당진영덕선", direction: ["상주", "청원"] },
    { routeName: "대구포항선", direction: ["익산", "포항"] },
    { routeName: "대전통영선", direction: ["통영", "하남"] },
    { routeName: "동해선", direction: ["동해", "속초"] },
    { routeName: "부산외곽순환선", direction: ["기장", "진영"] },
    { routeName: "서울양양선", direction: ["서울", "양양"] },
    { routeName: "서천공주선", direction: ["공주", "서천"] },
    { routeName: "서해안선", direction: ["목포", "시흥"] },
    { routeName: "수도권제1순환선", direction: ["퇴계원", "판교"] },
    { routeName: "순천완주선", direction: ["광양", "전주"] },
    { routeName: "영동선", direction: ["강릉", "인천"] },
    { routeName: "중북내륙선", direction: ["마산", "양평"] },
    { routeName: "중부내륙선의지선", direction: ["대구", "현풍"] },
    { routeName: "중앙선", direction: ["부산", "춘천"] },
    { routeName: "평택제천선", direction: ["제천", "평택"] },
    { routeName: "함양울산선", direction: ["밀양", "울산"] },
    { routeName: "호남선", direction: ["논산", "순천"] },
    { routeName: "호남선의지선", direction: ["논산", "대전"] },

  ];

function App() {
  const [data, setData] = useState([{}]);
  const [route, setRoute] = useState("");
  const [direc, setDirec] = useState([]);
  const [selDirect, setSelDirect] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submitKey, setSubmitKey] = useState("");
  const [page, setPage] = useState(1);
  const [oliName, setOliName] = useState("");
  const fetchData = useCallback(async () => {
    const res = await fetch(
      `http://data.ex.co.kr/openapi/business/curStateStation?key=test&type=json&numOfRows=99&pageNo=${page}&routeName=${route}&direction=${selDirect}&serviceAreaName=${submitKey}`
    ).then((res) => res.json());
    console.log(res.list);
    setData(res.list);
  }, [route, selDirect, submitKey, page]);

  useEffect(() => {
    console.log(keyword);
  }, [keyword]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const arr = data.filter((item) => {
    if (item.serviceAreaName) {
      return item;
    }
  });

  console.log(arr);

  return (
    <div className="App">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitKey(keyword);
        }}
      >
        <input
          class="input_search"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        ></input>
        <input class="input_search_but" type="submit" value="주유소명 검색 "></input>
      </form>
      <div>도로별 고속도로 주유소</div>
      {SearchData.map((item) => (
        
        <button
          onClick={() => {
            setDirec(item.direction);
            setRoute(item.routeName);
          }}
        >
          {item.routeName}
        </button>
      ))}
      <hr />
      <div>방향</div>
      {direc.map((item) => (

        <button
          onClick={() => {
            setSelDirect(item);
          }}
        >
          {item} 
        </button>
      ))}

      <hr />
      
      <button onClick={() => setPage((num) => num - 1)}><FontAwesomeIcon icon={faAngleLeft} /></button>
      <button onClick={() => setPage((num) => num + 1)}><FontAwesomeIcon icon={faAngleRight} /></button>
      <hr />
      {arr.map((item, index) => (
        <li>
          <a
            href="#"
            key={index}
            onClick={() => setOliName(item.serviceAreaName)}
          >
            <table class="gas-station-list">
              <tr>
                  <td>{item.serviceAreaName} </td>
                  <td>전화번호: {item.telNo} </td>
              </tr>
              <tr>
                  <td>휘발유가격: {item.gasolinePrice} </td>
                  <td>경유가격: {item.diselPrice} </td>
                  <td>LPG여부 :{item.lpgYn} </td>
                  <td>LPG가격: {item.lpgPrice} </td>
              </tr>
            </table>
          </a>
        </li>
      ))}
      <Kakaomap submitKey={oliName} />
    </div>
  );
}

export default App;

function Kakaomap({ submitKey }) {
  const [info, setInfo] = useState();
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState();

  useEffect(() => {
    if (!map) return;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(submitKey, (data, status, _pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        const bounds = new kakao.maps.LatLngBounds();
        let markers = [];

        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          markers.push({
            position: {
              lat: data[i].y,
              lng: data[i].x,
            },
            content: data[i].place_name,
          });
          // @ts-ignore
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }
        setMarkers(markers);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
      }
    });
  }, [map, submitKey]);

  return (
    <Map // 로드뷰를 표시할 Container
      center={{
        lat: 37.566826,
        lng: 126.9786567,
      }}
      style={{
        width: "100%",
        height: "350px",
        
      }}
      level={2}
      onCreate={setMap}
    >
      {markers.map((marker) => (
        <MapMarker
          key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
          position={marker.position}
          onClick={() => setInfo(marker)}
        >
          {info && info.content === marker.content && (
            <div style={{ color: "#000" }}>{marker.content}</div>
          )}
        </MapMarker>
      ))}
    </Map>
  );
}
