package checkchow.back.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthRegisterRequest {

    @NotBlank(message = "Los nombres no pueden estar vacíos")
    @Size(max = 120, message = "Los nombres no pueden exceder 120 caracteres")
    private String nombre_completo;

    @NotBlank(message = "El correo no puede estar vacío")
    @Email(message = "El correo debe tener un formato válido")
    @Size(max = 100, message = "El correo no puede exceder 100 caracteres")
    private String email;

    @NotBlank(message = "El celular no puede estar vacío")
    @Pattern(regexp = "\\d{9}", message = "El celular debe tener exactamente 9 dígitos")
    private String celular;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
            message = "La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un símbolo")
    private String password;
}
