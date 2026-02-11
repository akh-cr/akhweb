import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CityForm } from '../city-form'

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock dependencies
const mockSupabase = {
    from: vi.fn(),
}
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabase
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn()
    })
}))

const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn()
}))

vi.mock('sonner', () => ({
    toast: mockToast
}))

// Mock Tiptap to avoid complexity
vi.mock('@/components/tiptap', () => ({
    default: ({ onChange }: any) => <textarea data-testid="tiptap" onChange={(e) => onChange(e.target.value)} />
}))

// Mock ImageUpload
vi.mock('@/components/image-upload', () => ({
    ImageUpload: ({ onChange }: any) => <input data-testid="image-upload" onChange={(e) => onChange(e.target.value)} />
}))

// Mock server actions
const mockSearchCityCoordinates = vi.fn()
vi.mock('../actions', () => ({
    searchCityCoordinates: (...args: any[]) => mockSearchCityCoordinates(...args)
}))

describe('CityForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabase.from.mockReturnValue({
            insert: mockInsert,
            update: mockUpdate,
        })
        mockInsert.mockResolvedValue({ error: null })
        mockUpdate.mockReturnValue({ eq: mockEq })
        mockEq.mockResolvedValue({ error: null })
    })

    it('renders coordinate inputs only after toggle', () => {
        render(<CityForm />)
        // Search button should be visible
        expect(screen.getByText(/Vyhledat souřadnice dle názvu/i)).toBeTruthy()
        
        // Inputs should be hidden initially
        expect(screen.queryByLabelText(/Zeměpisná šířka/i)).toBeNull()
        expect(screen.queryByLabelText(/Zeměpisná délka/i)).toBeNull()
        
        // Click toggle
        fireEvent.click(screen.getByText(/Zadat souřadnice ručně/i))
        
        // Inputs should be visible now
        expect(screen.getByLabelText(/Zeměpisná šířka/i)).toBeTruthy()
        expect(screen.getByLabelText(/Zeměpisná délka/i)).toBeTruthy()
    })

    it('fetches coordinates and reveals inputs when search results are clicked', async () => {
        render(<CityForm />)
        
        // Fill name
        const nameInput = screen.getByLabelText(/Název města/i)
        fireEvent.change(nameInput, { target: { value: 'Brno' } })

        // Mock server action response
        const mockResponse = [{ lat: "49.195", lon: "16.606", display_name: "Brno, CZ" }]
        mockSearchCityCoordinates.mockResolvedValue(mockResponse)

        // Click search
        const searchBtn = screen.getByText(/Vyhledat souřadnice dle názvu/i)
        fireEvent.click(searchBtn)

        await waitFor(() => {
            expect(mockSearchCityCoordinates).toHaveBeenCalledWith('Brno')
            expect(mockToast.success).toHaveBeenCalled()
        })
        
        // Click on result
        const resultBtn = await screen.findByText("Brno, CZ")
        fireEvent.click(resultBtn)
        
        // Mock toast for selection
        expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining("Vybráno"))

        // Inputs should be revealed and have values
        expect((screen.getByLabelText(/Zeměpisná šířka/i) as HTMLInputElement).value).toBe("49.195")
        expect((screen.getByLabelText(/Zeměpisná délka/i) as HTMLInputElement).value).toBe("16.606")
    })

    it('submits form with coordinates', async () => {
        render(<CityForm />)
        
        // Fill basic info
        fireEvent.change(screen.getByLabelText(/Název města/i), { target: { value: 'Test City' } })
        
        // Reveal inputs
        fireEvent.click(screen.getByText(/Zadat souřadnice ručně/i))

        // Fill coordinates
        fireEvent.change(screen.getByLabelText(/Zeměpisná šířka/i), { target: { value: '50.0' } })
        fireEvent.change(screen.getByLabelText(/Zeměpisná délka/i), { target: { value: '15.0' } })

        // Submit
        const submitBtn = screen.getByText(/Vytvořit město/i)
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Test City',
                id: expect.any(String),
                metadata: expect.objectContaining({
                    map: {
                        lat: 50.0,
                        lon: 15.0
                    }
                })
            }))
        })
    })
})
