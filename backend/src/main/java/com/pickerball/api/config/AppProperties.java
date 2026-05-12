package com.pickerball.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Storage storage = new Storage();

    public Jwt getJwt() {
        return jwt;
    }

    public Cors getCors() {
        return cors;
    }

    public Storage getStorage() {
        return storage;
    }

    public static class Jwt {
        private String secret = "change-me";
        private long accessTokenExpirationMs = 86_400_000L;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getAccessTokenExpirationMs() {
            return accessTokenExpirationMs;
        }

        public void setAccessTokenExpirationMs(long accessTokenExpirationMs) {
            this.accessTokenExpirationMs = accessTokenExpirationMs;
        }
    }

    public static class Cors {
        private String allowedOrigins = "http://localhost:4200";

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    /** Lưu file gallery trên ổ đĩa (đường dẫn tuyệt đối hoặc tương đối thư mục chạy). */
    public static class Storage {
        private String galleryDir = "data/gallery";
        private long maxFileSizeBytes = 10 * 1024 * 1024L;

        public String getGalleryDir() {
            return galleryDir;
        }

        public void setGalleryDir(String galleryDir) {
            this.galleryDir = galleryDir;
        }

        public long getMaxFileSizeBytes() {
            return maxFileSizeBytes;
        }

        public void setMaxFileSizeBytes(long maxFileSizeBytes) {
            this.maxFileSizeBytes = maxFileSizeBytes;
        }
    }
}
