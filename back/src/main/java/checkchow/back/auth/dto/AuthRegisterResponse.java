package checkchow.back.auth.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthRegisterResponse {
    private Long id;
    private String nombre_completo;
    private String email;
    private LocalDateTime createdAt;
}