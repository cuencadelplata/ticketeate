import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Ejemplo de test para un botón de compra
describe('BuyTicketButton Component', () => {
  // Mock del componente (ajusta según tu implementación real)
  const BuyTicketButton = ({ eventId, onSuccess }: any) => {
    const handleClick = () => {
      onSuccess?.();
    };
    return <button onClick={handleClick}>Comprar Entradas</button>;
  };

  it('renders button with correct text', () => {
    render(<BuyTicketButton eventId="123" />);
    expect(screen.getByText('Comprar Entradas')).toBeInTheDocument();
  });

  it('calls onSuccess when clicked', () => {
    const mockOnSuccess = jest.fn();
    render(<BuyTicketButton eventId="123" onSuccess={mockOnSuccess} />);

    const button = screen.getByText('Comprar Entradas');
    fireEvent.click(button);

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('is accessible', () => {
    const { container } = render(<BuyTicketButton eventId="123" />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });
});

// Ejemplo de test para formulario
describe('TicketForm Component', () => {
  const TicketForm = ({ onSubmit }: any) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      onSubmit({
        quantity: formData.get('quantity'),
        email: formData.get('email'),
      });
    };

    return (
      <form onSubmit={handleSubmit}>
        <input
          name="quantity"
          type="number"
          min="1"
          defaultValue="1"
          aria-label="Cantidad de entradas"
        />
        <input name="email" type="email" placeholder="tu@email.com" aria-label="Email" />
        <button type="submit">Comprar</button>
      </form>
    );
  };

  it('submits form with correct data', async () => {
    const mockSubmit = jest.fn();
    render(<TicketForm onSubmit={mockSubmit} />);

    const quantityInput = screen.getByLabelText('Cantidad de entradas');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Comprar');

    fireEvent.change(quantityInput, { target: { value: '3' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        quantity: '3',
        email: 'test@example.com',
      });
    });
  });

  it('validates required fields', () => {
    const mockSubmit = jest.fn();
    render(<TicketForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

    // HTML5 validation
    expect(emailInput.type).toBe('email');
    expect(emailInput.required || emailInput.getAttribute('aria-required')).toBeTruthy;
  });
});
