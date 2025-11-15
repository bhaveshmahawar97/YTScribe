package com.example.auth.repository;

import com.example.auth.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {

    Optional<RefreshToken> findByTokenIdAndRevokedFalse(String tokenId);

    List<RefreshToken> findByUserIdAndRevokedFalse(String userId);
}
