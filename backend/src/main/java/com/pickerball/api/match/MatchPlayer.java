package com.pickerball.api.match;

import com.pickerball.api.user.User;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "match_players")
public class MatchPlayer {

    @EmbeddedId
    private MatchPlayerId id;

    @MapsId("matchId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private GameMatch match;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public MatchPlayerId getId() {
        return id;
    }

    public void setId(MatchPlayerId id) {
        this.id = id;
    }

    public GameMatch getMatch() {
        return match;
    }

    public void setMatch(GameMatch match) {
        this.match = match;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
