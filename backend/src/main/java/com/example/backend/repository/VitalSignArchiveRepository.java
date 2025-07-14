package com.example.backend.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import com.example.backend.DB.VitalSigns;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Repository
public class VitalSignArchiveRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private DataSource dataSource;

    // ====================================================================
    // 1. 테이블 존재 확인 및 생성
    // ====================================================================
    
    /**
     * 아카이브 테이블 존재 여부 확인
     */
    public boolean isArchiveTableExists(int year) {
        String sql = "SELECT COUNT(*) FROM information_schema.tables " +
                    "WHERE table_schema = DATABASE() AND table_name = ?";
        String tableName = "vital_signs_archive_" + year;
        
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName);
        return count != null && count > 0;
    }
    
    /**
     * 아카이브 테이블 자동 생성
     */
    public void createArchiveTableIfNotExists(int year) {
        String tableName = "vital_signs_archive_" + year;
        
        if (!isArchiveTableExists(year)) {
            String createSql = String.format("""
                CREATE TABLE %s (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    senior_id INT(11) NOT NULL,
                    measurement_time DATETIME NOT NULL,
                    blood_pressure_high INT(11) DEFAULT NULL,
                    blood_pressure_low INT(11) DEFAULT NULL,
                    heart_rate INT(11) DEFAULT NULL,
                    blood_sugar INT(11) DEFAULT NULL,
                    body_temperature DECIMAL(4,2) DEFAULT NULL,
                    is_normal TINYINT(1) DEFAULT 1,
                    notes TEXT DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_senior_time (senior_id, measurement_time),
                    INDEX idx_measurement_time (measurement_time),
                    INDEX idx_senior_created (senior_id, created_at),
                    FOREIGN KEY (senior_id) REFERENCES seniors(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci 
                COMMENT='%d년 생체신호 아카이브'
                """, tableName, year);
            
            jdbcTemplate.execute(createSql);
            System.out.println("Archive table created: " + tableName);
        }
    }

    // ====================================================================
    // 2. 연도별 데이터 조회
    // ====================================================================
    
    /**
     * 연도에 따른 테이블명 결정
     */
    private String getTableNameByYear(int year) {
        int currentYear = LocalDateTime.now().getYear();
        if (year == currentYear) {
            return "vital_signs";
        } else {
            createArchiveTableIfNotExists(year); // 없으면 자동 생성
            return "vital_signs_archive_" + year;
        }
    }
    
    /**
     * 특정 연도의 특정 senior 생체 데이터 조회
     */
    public List<VitalSigns> findByYearAndSeniorId(int year, Integer seniorId) {
        String tableName = getTableNameByYear(year);
        String sql = "SELECT * FROM " + tableName + 
                    " WHERE senior_id = ? AND YEAR(measurement_time) = ? " +
                    "ORDER BY measurement_time DESC";
        
        return jdbcTemplate.query(sql, vitalSignsRowMapper(), seniorId, year);
    }
    
    /**
     * 특정 연도의 특정 senior 생체 데이터 (페이징)
     */
    public List<VitalSigns> findByYearAndSeniorIdWithPaging(int year, Integer seniorId, 
                                                           int offset, int limit) {
        String tableName = getTableNameByYear(year);
        String sql = "SELECT * FROM " + tableName + 
                    " WHERE senior_id = ? AND YEAR(measurement_time) = ? " +
                    "ORDER BY measurement_time DESC LIMIT ? OFFSET ?";
        
        return jdbcTemplate.query(sql, vitalSignsRowMapper(), seniorId, year, limit, offset);
    }
    
    /**
     * 특정 연도의 특정 기간 데이터 조회
     */
    public List<VitalSigns> findByYearAndDateRange(int year, Integer seniorId, 
                                                  LocalDateTime startDate, LocalDateTime endDate) {
        String tableName = getTableNameByYear(year);
        String sql = "SELECT * FROM " + tableName + 
                    " WHERE senior_id = ? AND measurement_time BETWEEN ? AND ? " +
                    "ORDER BY measurement_time DESC";
        
        return jdbcTemplate.query(sql, vitalSignsRowMapper(), seniorId, startDate, endDate);
    }

    // ====================================================================
    // 3. 사용 가능한 연도 목록 조회
    // ====================================================================
    
    /**
     * 데이터가 있는 연도 목록 조회
     */
    public List<Integer> getAvailableYears() {
        List<Integer> years = new ArrayList<>();
        
        // 현재 테이블에서 연도 조회
        String currentSql = "SELECT DISTINCT YEAR(measurement_time) as year " +
                           "FROM vital_signs ORDER BY year DESC";
        List<Integer> currentYears = jdbcTemplate.queryForList(currentSql, Integer.class);
        years.addAll(currentYears);
        
        // 아카이브 테이블들에서 연도 추출
        String archiveSql = "SELECT table_name FROM information_schema.tables " +
                           "WHERE table_schema = DATABASE() AND table_name LIKE 'vital_signs_archive_%'";
        List<String> archiveTables = jdbcTemplate.queryForList(archiveSql, String.class);
        
        for (String tableName : archiveTables) {
            try {
                int year = Integer.parseInt(tableName.substring("vital_signs_archive_".length()));
                if (!years.contains(year)) {
                    years.add(year);
                }
            } catch (NumberFormatException e) {
                // 잘못된 테이블명은 무시
            }
        }
        
        years.sort((a, b) -> b.compareTo(a)); // 내림차순 정렬
        return years;
    }
    
    /**
     * 특정 연도의 데이터 개수 조회
     */
    public int getRecordCountByYear(int year) {
        String tableName = getTableNameByYear(year);
        String sql = "SELECT COUNT(*) FROM " + tableName + " WHERE YEAR(measurement_time) = ?";
        
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, year);
        return count != null ? count : 0;
    }

    // ====================================================================
    // 4. 데이터 이관 (스케줄러에서 사용)
    // ====================================================================
    
    /**
     * 특정 연도 데이터를 아카이브 테이블로 이관
     */
    public int migrateDataToArchive(int year) {
        String archiveTableName = "vital_signs_archive_" + year;
        
        // 아카이브 테이블 생성
        createArchiveTableIfNotExists(year);
        
        // 데이터 이관 (중복 방지)
        String migrationSql = String.format("""
            INSERT INTO %s 
            (senior_id, measurement_time, blood_pressure_high, blood_pressure_low, 
             heart_rate, blood_sugar, body_temperature, is_normal, notes, created_at)
            SELECT senior_id, measurement_time, blood_pressure_high, blood_pressure_low,
                   heart_rate, blood_sugar, body_temperature, is_normal, notes, created_at
            FROM vital_signs 
            WHERE YEAR(measurement_time) = ?
            AND NOT EXISTS (
                SELECT 1 FROM %s archive 
                WHERE archive.senior_id = vital_signs.senior_id 
                AND archive.measurement_time = vital_signs.measurement_time
            )
            """, archiveTableName, archiveTableName);
        
        return jdbcTemplate.update(migrationSql, year);
    }
    
    /**
     * 이관 후 원본 데이터 삭제 (신중하게 사용)
     */
    public int deleteOriginalDataAfterMigration(int year) {
        // 현재 연도는 삭제하지 않음
        int currentYear = LocalDateTime.now().getYear();
        if (year >= currentYear) {
            throw new IllegalArgumentException("현재 연도 이후 데이터는 삭제할 수 없습니다.");
        }
        
        String deleteSql = "DELETE FROM vital_signs WHERE YEAR(measurement_time) = ?";
        return jdbcTemplate.update(deleteSql, year);
    }

    // ====================================================================
    // 5. 동적 쿼리 실행 유틸리티
    // ====================================================================
    
    /**
     * 안전한 동적 테이블명 쿼리 실행
     */
    public List<VitalSigns> executeCustomQuery(String baseQuery, int year, Object... params) {
        String tableName = getTableNameByYear(year);
        String finalQuery = baseQuery.replace("{TABLE_NAME}", tableName);
        
        return jdbcTemplate.query(finalQuery, vitalSignsRowMapper(), params);
    }

    // ====================================================================
    // 6. RowMapper 정의
    // ====================================================================
    
    private RowMapper<VitalSigns> vitalSignsRowMapper() {
        return (rs, rowNum) -> VitalSigns.builder()
            .id(rs.getLong("id"))
            .measurementTime(rs.getTimestamp("measurement_time").toLocalDateTime())
            .bloodPressureHigh(rs.getObject("blood_pressure_high", Integer.class))
            .bloodPressureLow(rs.getObject("blood_pressure_low", Integer.class))
            .heartRate(rs.getObject("heart_rate", Integer.class))
            .bloodSugar(rs.getObject("blood_sugar", Integer.class))
            .bodyTemperature(rs.getBigDecimal("body_temperature"))
            .isNormal(rs.getBoolean("is_normal"))
            .notes(rs.getString("notes"))
            .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
            .build();
    }

    // ====================================================================
    // 7. 실제 Controller에서 사용할 메서드들
    // ====================================================================
    
    /**
     * API: /api/vital-signs?year=2024&seniorId=1
     */
    public List<VitalSigns> getVitalSignsByYearAndSenior(int year, Integer seniorId) {
        return findByYearAndSeniorId(year, seniorId);
    }
    
    /**
     * API: /api/vital-signs/years
     */
    public List<YearInfo> getYearInfoList() {
        List<YearInfo> yearInfos = new ArrayList<>();
        List<Integer> years = getAvailableYears();
        
        for (Integer year : years) {
            int count = getRecordCountByYear(year);
            boolean isCurrentYear = year == LocalDateTime.now().getYear();
            yearInfos.add(new YearInfo(year, count, isCurrentYear));
        }
        
        return yearInfos;
    }
    
    // YearInfo DTO 클래스
    public static class YearInfo {
        private int year;
        private int recordCount;
        private boolean isCurrentYear;
        
        public YearInfo(int year, int recordCount, boolean isCurrentYear) {
            this.year = year;
            this.recordCount = recordCount;
            this.isCurrentYear = isCurrentYear;
        }
        
        // getters and setters
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        public int getRecordCount() { return recordCount; }
        public void setRecordCount(int recordCount) { this.recordCount = recordCount; }
        public boolean isCurrentYear() { return isCurrentYear; }
        public void setCurrentYear(boolean currentYear) { isCurrentYear = currentYear; }
    }
}
