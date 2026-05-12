package com.pickerball.api.match;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class MatchPlayerId implements Serializable {

    @Column(name = "match_id")
    private Long matchId;

    @Column(name = "user_id")
    private Long userId;

    protected MatchPlayerId() {}

    public MatchPlayerId(Long matchId, Long userId) {
        this.matchId = matchId;
        this.userId = userId;
    }

    public Long getMatchId() {
        return matchId;
    }

    public Long getUserId() {
        return userId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        MatchPlayerId that = (MatchPlayerId) o;
        return Objects.equals(matchId, that.matchId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(matchId, userId);
    }
}
