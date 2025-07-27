/**
 * 향상된 주소 검색 유틸리티
 * 문제: 카카오 주소 검색 API 결과가 실제 카카오맵 검색 결과와 다름
 * 해결: 다중 검색 방식으로 가장 정확한 결과 찾기
 */

import { searchAddressToCoord, searchPlacesByKeyword } from './kakaoAPI.js';

/**
 * 향상된 주소 검색 - 여러 방식을 조합하여 정확한 위치 찾기
 * @param {string} address - 검색할 주소
 * @returns {Promise<Object>} 검색 결과
 */
export const enhancedAddressSearch = async (address) => {
  console.log('🔍 향상된 주소 검색 시작:', address);
  
  const results = [];
  
  try {
    // 1. 기본 주소 검색
    console.log('1️⃣ 기본 주소 검색 시도');
    try {
      const basicResult = await searchAddressToCoord(address);
      if (basicResult.success) {
        results.push({
          method: 'address_search',
          score: 80,
          latitude: basicResult.y,
          longitude: basicResult.x,
          address: basicResult.address,
          roadAddress: basicResult.roadAddress,
          source: '주소 검색 API'
        });
        console.log('✅ 기본 주소 검색 성공:', basicResult);
      }
    } catch (error) {
      console.warn('⚠️ 기본 주소 검색 실패:', error.message);
    }

    // 2. 건물명 키워드 검색
    const buildingName = extractBuildingName(address);
    if (buildingName) {
      console.log('2️⃣ 건물명 키워드 검색:', buildingName);
      try {
        const keywordResult = await searchPlacesByKeyword(buildingName);
        if (keywordResult.success && keywordResult.places.length > 0) {
          // 주소 유사성 검사
          const matchedPlace = findBestAddressMatch(keywordResult.places, address);
          if (matchedPlace) {
            results.push({
              method: 'keyword_search',
              score: 95, // 점수 상향 조정 (키워드 검색이 더 정확한 경우가 많음)
              latitude: matchedPlace.y,
              longitude: matchedPlace.x,
              address: matchedPlace.address,
              roadAddress: matchedPlace.roadAddress,
              placeName: matchedPlace.name,
              source: '키워드 검색 API'
            });
            console.log('✅ 건물명 검색 성공:', matchedPlace);
          }
        }
      } catch (error) {
        console.warn('⚠️ 건물명 검색 실패:', error.message);
      }
    }

    // 3. 지역명 + 건물명 조합 검색
    const regionAndBuilding = extractRegionAndBuilding(address);
    if (regionAndBuilding) {
      console.log('3️⃣ 지역명+건물명 검색:', regionAndBuilding);
      try {
        const combinedResult = await searchPlacesByKeyword(regionAndBuilding);
        if (combinedResult.success && combinedResult.places.length > 0) {
          const matchedPlace = findBestAddressMatch(combinedResult.places, address);
          if (matchedPlace) {
            results.push({
              method: 'combined_search',
              score: 92, // 조합 검색도 높은 점수
              latitude: matchedPlace.y,
              longitude: matchedPlace.x,
              address: matchedPlace.address,
              roadAddress: matchedPlace.roadAddress,
              placeName: matchedPlace.name,
              source: '조합 검색 API'
            });
            console.log('✅ 조합 검색 성공:', matchedPlace);
          }
        }
      } catch (error) {
        console.warn('⚠️ 조합 검색 실패:', error.message);
      }
    }

    // 4. 단계별 주소 축약 검색
    const addressVariations = getAddressVariations(address);
    for (let i = 0; i < addressVariations.length; i++) {
      const variation = addressVariations[i];
      console.log(`4️⃣ 주소 축약 검색 ${i+1}:`, variation);
      
      try {
        const variationResult = await searchAddressToCoord(variation);
        if (variationResult.success) {
          results.push({
            method: `address_variation_${i+1}`,
            score: 75 - (i * 5), // 더 구체적일수록 높은 점수
            latitude: variationResult.y,
            longitude: variationResult.x,
            address: variationResult.address,
            roadAddress: variationResult.roadAddress,
            source: `축약 검색 ${i+1}`
          });
          console.log(`✅ 축약 검색 ${i+1} 성공:`, variationResult);
        }
      } catch (error) {
        console.warn(`⚠️ 축약 검색 ${i+1} 실패:`, error.message);
      }
    }

    // 5. 결과 분석 및 최적 선택
    if (results.length === 0) {
      console.error('❌ 모든 검색 방법 실패');
      return {
        success: false,
        message: '주소를 찾을 수 없습니다',
        searchedAddress: address
      };
    }

    // 점수순으로 정렬
    results.sort((a, b) => b.score - a.score);
    
    console.log('📊 검색 결과 분석:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. [${result.score}점] ${result.method}: ${result.latitude}, ${result.longitude} (${result.source})`);
    });

    // 최고 점수 결과 반환
    const bestResult = results[0];
    console.log('🏆 최적 결과 선택:', bestResult);

    return {
      success: true,
      latitude: bestResult.latitude,
      longitude: bestResult.longitude,
      address: bestResult.address,
      roadAddress: bestResult.roadAddress,
      placeName: bestResult.placeName,
      method: bestResult.method,
      source: bestResult.source,
      score: bestResult.score,
      allResults: results,
      originalAddress: address
    };

  } catch (error) {
    console.error('❌ 향상된 주소 검색 전체 오류:', error);
    return {
      success: false,
      message: '주소 검색 중 오류 발생',
      error: error.message,
      searchedAddress: address
    };
  }
};

/**
 * 주소에서 건물명 추출 - 향상된 패턴
 * @param {string} address - 전체 주소
 * @returns {string|null} 건물명
 */
function extractBuildingName(address) {
  // 더 포괄적인 건물명 패턴 매칭
  const patterns = [
    // 일반 아파트/빌딩
    /([가-힣\w]+(?:아파트|APT|빌딩|빌리딩|타워|TOWER|스카이뷰|하우스|빌라|맨션|플레이스|센터|오피스텔))/i,
    // 브랜드 아파트 (캐슬 계열 추가)
    /([가-힣\w]*(?:자이|푸르지오|래미안|아이파크|더샵|힐스테이트|포레나|센트럴|엘크루|트리지움|롯데캐슬|캐슬))/i,
    // 특수 명칭
    /([가-힣\w]+(?:스카이뷰|하이츠|팰리스|그랜드|리버|파크|힐즈|베이|시티|가든))/i,
    // 마린시티 특별 처리
    /(마린시티[가-힣\w]*)/i
  ];

  for (const pattern of patterns) {
    const match = address.match(pattern);
    if (match) {
      console.log(`🏢 건물명 추출: "${match[1].trim()}" (패턴: ${pattern})`);
      return match[1].trim();
    }
  }

  console.log('🔍 건물명을 찾을 수 없음:', address);
  return null;
}

/**
 * 지역명과 건물명 조합 추출 - 향상된 버전
 * @param {string} address - 전체 주소
 * @returns {string|null} 지역명 + 건물명
 */
function extractRegionAndBuilding(address) {
  console.log('🔍 지역명+건물명 조합 추출:', address);
  
  // 구 + 동 + 건물명 패턴 (가장 구체적)
  const regionMatch = address.match(/([가-힣]+구)\s+([가-힣]+동)/);
  const buildingName = extractBuildingName(address);
  
  if (regionMatch && buildingName) {
    const combination1 = `${regionMatch[1]} ${regionMatch[2]} ${buildingName}`;
    console.log('📍 구+동+건물명:', combination1);
    return combination1;
  }
  
  // 시 + 구 + 건물명 패턴
  const cityMatch = address.match(/([가-힣]+시)\s+([가-힣]+구)/);
  if (cityMatch && buildingName) {
    const combination2 = `${cityMatch[1]} ${cityMatch[2]} ${buildingName}`;
    console.log('📍 시+구+건물명:', combination2);
    return combination2;
  }
  
  // 동 + 건물명 패턴 (동명이 명확한 경우)
  const dongMatch = address.match(/([가-힣]+동)/);
  if (dongMatch && buildingName) {
    const combination3 = `${dongMatch[1]} ${buildingName}`;
    console.log('📍 동+건물명:', combination3);
    return combination3;
  }

  console.log('❌ 지역명+건물명 조합을 추출할 수 없음');
  return null;
}

/**
 * 주소의 다양한 변형 생성 - 호수 우선 제거
 * @param {string} address - 원본 주소
 * @returns {string[]} 주소 변형 배열
 */
function getAddressVariations(address) {
  const variations = [];
  
  console.log('🔍 주소 변형 생성:', address);
  
  // 1. 호수 제거 (최우선 - 가장 일반적인 문제)
  let withoutUnit = address.replace(/\s*\d+호.*$/, '');
  if (withoutUnit !== address) {
    variations.push(withoutUnit);
    console.log('🏠 호수 제거:', withoutUnit);
  }
  
  // 2. 동, 호 제거
  let withoutDongHo = address.replace(/\s*\d+동.*$/, '');
  if (withoutDongHo !== address && withoutDongHo !== withoutUnit) {
    variations.push(withoutDongHo);
    console.log('🏠 동+호 제거:', withoutDongHo);
  }
  
  // 3. 건물명만 남기기
  const buildingOnly = extractBuildingName(address);
  if (buildingOnly && !variations.includes(buildingOnly)) {
    variations.push(buildingOnly);
    console.log('🏢 건물명만:', buildingOnly);
  }
  
  // 4. 시, 구, 동까지만
  const regionMatch = address.match(/^([가-힣]+시\s+[가-힣]+구\s+[가-힣]+동)/);
  if (regionMatch && !variations.includes(regionMatch[1])) {
    variations.push(regionMatch[1]);
    console.log('📍 시+구+동:', regionMatch[1]);
  }
  
  // 5. 구, 동까지만
  const districtMatch = address.match(/([가-힣]+구\s+[가-힣]+동)/);
  if (districtMatch && !variations.includes(districtMatch[1])) {
    variations.push(districtMatch[1]);
    console.log('📍 구+동:', districtMatch[1]);
  }
  
  console.log(`📊 총 ${variations.length}개 변형 생성됨:`, variations);
  return variations;
}

/**
 * 검색 결과에서 주소가 가장 유사한 장소 찾기 - 편의점/상가 제외
 * @param {Array} places - 검색된 장소 배열
 * @param {string} targetAddress - 대상 주소
 * @returns {Object|null} 가장 유사한 장소
 */
function findBestAddressMatch(places, targetAddress) {
  if (!places || places.length === 0) return null;
  
  // 제외할 카테고리 (편의점, 상가 등)
  const EXCLUDED_CATEGORIES = [
    'cs2', 'ce7', 'fd6', 'ol7', // 편의점, 카페, 음식점, 주유소
    '편의점', '카페', '마트', '슈퍼', '상가', '점포', '매장'
  ];
  
  // 우선할 카테고리 (주거지, 건물)
  const PREFERRED_CATEGORIES = [
    '아파트', '빌라', '주택', '오피스텔', '빌딩', '타워', '건물', '단지'
  ];
  
  let bestMatch = null;
  let highestScore = 0;
  
  const targetWords = targetAddress.toLowerCase().replace(/\s+/g, '').split('');
  
  places.forEach(place => {
    const placeAddress = (place.address || '').toLowerCase().replace(/\s+/g, '');
    const placeName = (place.name || '').toLowerCase().replace(/\s+/g, '');
    const placeCategory = (place.category || '').toLowerCase();
    
    // 제외할 카테고리 확인
    const isExcluded = EXCLUDED_CATEGORIES.some(excluded => 
      placeCategory.includes(excluded) || placeName.includes(excluded)
    );
    
    if (isExcluded) {
      console.log(`🚫 제외된 장소: ${place.name} (${placeCategory}) - 편의점/상가`);      
      return; // 이 장소는 건너뛰기
    }
    
    // 주소 유사도 계산
    let addressScore = calculateSimilarity(placeAddress, targetAddress.toLowerCase().replace(/\s+/g, ''));
    
    // 장소명에 건물명이 포함되어 있으면 가점
    const buildingName = extractBuildingName(targetAddress);
    if (buildingName && placeName.includes(buildingName.toLowerCase().replace(/\s+/g, ''))) {
      addressScore += 40; // 건물명 매칭 시 높은 가점
      console.log(`🏢 건물명 매칭: ${place.name} (+40점)`);
    }
    
    // 우선 카테고리에 포함되면 가점
    const isPreferred = PREFERRED_CATEGORIES.some(preferred => 
      placeCategory.includes(preferred) || placeName.includes(preferred)
    );
    
    if (isPreferred) {
      addressScore += 30;
      console.log(`🏠 주거지 카테고리: ${place.name} (+30점)`);
    }
    
    // 지역명 매칭 확인 (더 엄격한 검증)
    const regionMatch = targetAddress.match(/([가-힣]+구)\s+([가-힣]+동)/);
    if (regionMatch) {
      const gu = regionMatch[1];
      const dong = regionMatch[2];
      
      // 구와 동이 모두 매칭되어야 높은 점수
      if (placeAddress.includes(gu) && placeAddress.includes(dong)) {
        addressScore += 30; // 구+동 매칭 시 높은 가점
        console.log(`📍 구+동 매칭: ${place.name} (${gu} ${dong}) (+30점)`);
      } else if (placeAddress.includes(gu)) {
        addressScore += 15; // 구만 매칭
        console.log(`📍 구 매칭: ${place.name} (${gu}) (+15점)`);
      }
    } else {
      // 구만 있는 경우
      const guMatch = targetAddress.match(/([가-힣]+구)/);
      if (guMatch && placeAddress.includes(guMatch[1])) {
        addressScore += 10;
        console.log(`📍 구 매칭: ${place.name} (${guMatch[1]}) (+10점)`);
      }
    }
    
    console.log(`📊 ${place.name}: ${addressScore}점 (카테고리: ${placeCategory})`);
    
    if (addressScore > highestScore) {
      highestScore = addressScore;
      bestMatch = place;
    }
  });
  
  if (bestMatch) {
    console.log(`🏆 최종 선택: ${bestMatch.name} (${highestScore}점)`);
  } else {
    console.log('❌ 적절한 매칭 결과를 찾을 수 없음');
  }
  
  // 최소 임계값 설정 (70% 이상 유사해야 함 - 기준 강화)
  return highestScore >= 70 ? bestMatch : null;
}

/**
 * 문자열 유사도 계산 (레벤시타인 거리 기반)
 * @param {string} str1 - 첫 번째 문자열
 * @param {string} str2 - 두 번째 문자열
 * @returns {number} 유사도 점수 (0-100)
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 100 : 0;
  if (len2 === 0) return 0;
  
  const matrix = [];
  
  // 초기화
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }
  
  // 계산
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      const cost = str1[j - 1] === str2[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // 삭제
        matrix[i][j - 1] + 1,     // 삽입
        matrix[i - 1][j - 1] + cost // 교체
      );
    }
  }
  
  const distance = matrix[len2][len1];
  const maxLength = Math.max(len1, len2);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return similarity;
}

/**
 * 검색 결과 검증 - 실제 카카오맵 검색과 비교
 * @param {Object} result - 검색 결과
 * @param {string} originalAddress - 원본 주소
 * @returns {Object} 검증된 결과
 */
export const validateSearchResult = async (result, originalAddress) => {
  console.log('🔍 검색 결과 검증 시작');
  
  // 구글 맵 링크로 확인 가능하도록
  const googleMapsUrl = `https://www.google.com/maps?q=${result.latitude},${result.longitude}`;
  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(originalAddress)},${result.latitude},${result.longitude}`;
  
  console.log('📍 검증용 링크:');
  console.log('- 구글 맵:', googleMapsUrl);
  console.log('- 카카오 맵:', kakaoMapUrl);
  
  return {
    ...result,
    verification: {
      googleMapsUrl,
      kakaoMapUrl,
      coordinates: `${result.latitude}, ${result.longitude}`,
      recommendedAction: '위 링크들로 실제 위치를 확인해보세요'
    }
  };
};
