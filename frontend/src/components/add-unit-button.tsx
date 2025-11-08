import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorModal } from "@/components/error-modal";
import { api, ApiError } from "@/lib/api";

export default function AddUnitButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unitNumber, setUnitNumber] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [numOccupants, setNumOccupants] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Basic form validation
    if (!name.trim() || !unitNumber.trim()) {
      setErrorMessage("Apartment Name and Unit Number are required fields.");
      setErrorModalOpen(true);
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Description is required.");
      setErrorModalOpen(true);
      return;
    }

    if (!price.trim() || !numOccupants.trim()) {
      setErrorMessage("Price and Max Number of Occupants are required fields.");
      setErrorModalOpen(true);
      return;
    }

    if (isNaN(Number(price)) || isNaN(Number(numOccupants))) {
      setErrorMessage(
        "Price and Max Number of Occupants must be valid numbers."
      );
      setErrorModalOpen(true);
      return;
    }

    const body = {
      unitNumber: unitNumber.trim(),
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      numOccupants: Number(numOccupants),
    };

    try {
      await api.post("/api/units/add", body);

      // Reset form fields on success
      resetForm();
      setIsOpen(false);
      window.location.reload();
    } catch (error: unknown) {
      let displayMessage = "Failed to add unit. Please try again.";

      if (error instanceof ApiError) {
        if (error.message.includes("The unit already exists")) {
          displayMessage = `A unit with apartment name "${name}" and unit number "${unitNumber}" already exists. Please use different values or check existing units.`;
        } else {
          displayMessage = error.message;
        }
      } else if (error instanceof Error) {
        displayMessage = error.message;
      }

      console.error("Error submitting unit:", error);
      setErrorMessage(displayMessage);
      setErrorModalOpen(true);
    }
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    setErrorMessage("");
  };

  const resetForm = () => {
    setUnitNumber("");
    setName("");
    setDescription("");
    setNumOccupants("");
    setPrice("");
  };

  const handleModalClose = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add</Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-[600px] bg-card">
            <CardHeader>
              <CardTitle>Add Unit Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 py-2">
                <div>
                  <Label className="py-1">
                    Apartment Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Tanglewood Drive"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="py-1">
                    Unit Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="G"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="py-1">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Studio Apartment"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="py-1">
                      Max Number of Occupants{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="2"
                      value={numOccupants}
                      onChange={(e) => setNumOccupants(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="py-1">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="15000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <div className="flex gap-4">
                <Button variant="secondary" onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      <ErrorModal
        open={errorModalOpen}
        title="Unable to Add Unit"
        message={errorMessage}
        onClose={closeErrorModal}
      />
    </>
  );
}
