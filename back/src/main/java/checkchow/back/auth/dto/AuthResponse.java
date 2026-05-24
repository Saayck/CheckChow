package checkchow.back.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
@AllArgsConstructor
public class AuthResponse {
    private String status;
    private String message;
    private String token;
    private Long userId;
    private String nombre;
    private String refreshToken;
}
